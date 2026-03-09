"use client"

import { useEffect, useMemo, useState } from "react"
import { citaService } from "@/services/cita.service"
import { useToast } from "@/hooks/use-toast"
import { CatalogoCitaPublicaDto, CreateCitaPublicaDto, HorariosDisponiblesCitaDto } from "@/types/cita"

function toIsoDateTime(localDateTime: string) {
  if (!localDateTime) {
    return localDateTime
  }

  return localDateTime.length === 16 ? `${localDateTime}:00` : localDateTime
}

function toDateInputValue(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function toDateTimeLocalInputValue(isoValue: string) {
  return isoValue ? isoValue.slice(0, 16) : ""
}

function parsePositiveInt(value: string | number | undefined): number {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? value : 0
  }

  if (typeof value !== "string") {
    return 0
  }

  const parsed = Number.parseInt(value.trim(), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

export function usePublicAppointment(initialClinicaId?: number) {
  const { showToast } = useToast()

  const initialIdClinica = parsePositiveInt(initialClinicaId)
  const [idClinica, setIdClinica] = useState<number>(initialIdClinica)
  const [idClinicaInput, setIdClinicaInput] = useState<string>(initialIdClinica > 0 ? String(initialIdClinica) : "")
  const [catalogo, setCatalogo] = useState<CatalogoCitaPublicaDto | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [catalogWarning, setCatalogWarning] = useState<string | null>(null)

  const [nombres, setNombres] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [correo, setCorreo] = useState("")
  const [telefono, setTelefono] = useState("")
  const [fechaHoraInicioPlan, setFechaHoraInicioPlan] = useState("")
  const [fechaAgenda, setFechaAgenda] = useState(toDateInputValue(new Date()))
  const [idSucursal, setIdSucursal] = useState<number>(0)
  const [idEspecialidad, setIdEspecialidad] = useState<number>(0)
  const [idsServicios, setIdsServicios] = useState<number[]>([])
  const [notas, setNotas] = useState("")

  const [disponibilidad, setDisponibilidad] = useState<HorariosDisponiblesCitaDto | null>(null)
  const [disponibilidadLoading, setDisponibilidadLoading] = useState(false)
  const [disponibilidadError, setDisponibilidadError] = useState<string | null>(null)

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
      idClinica > 0 &&
      idSucursal > 0 &&
      idEspecialidad > 0 &&
      idsServicios.length > 0 &&
      nombres.trim().length >= 2 &&
      apellidos.trim().length >= 2 &&
      correo.trim().length > 4 &&
      fechaHoraInicioPlan.trim().length > 0
    )
  }, [idClinica, idSucursal, idEspecialidad, idsServicios, nombres, apellidos, correo, fechaHoraInicioPlan])

  const cuposDisponiblesEspecialidad = useMemo(() => {
    if (!disponibilidad) return 0
    return Math.max(0, disponibilidad.citasMaximasPorDiaEspecialidad - disponibilidad.citasOcupadasDiaEspecialidad)
  }, [disponibilidad])

  const loadCatalogo = async (clinicaIdValue: number | string = idClinicaInput) => {
    const clinicaId = parsePositiveInt(clinicaIdValue)

    if (!clinicaId || clinicaId <= 0) {
      setCatalogo(null)
      setIdClinica(0)
      setCatalogError("Debes indicar un ID de clínica válido.")
      return
    }

    setCatalogLoading(true)
    setCatalogError(null)
    setCatalogWarning(null)

    try {
      const result = await citaService.obtenerCatalogoPublico(clinicaId)
      setCatalogo(result)
      setIdClinica(clinicaId)
      setIdClinicaInput(String(clinicaId))
      const primeraSucursal = result.sucursales[0]
      setIdSucursal((prev) => {
        if (prev > 0 && result.sucursales.some((sucursal) => sucursal.id === prev)) {
          return prev
        }

        return primeraSucursal?.id ?? 0
      })

      setIdEspecialidad((prev) => {
        const especialidadesSucursal = result.especialidadesPorSucursal.filter((item) => item.idSucursal === (result.sucursales[0]?.id ?? 0))
        if (prev > 0 && result.especialidadesPorSucursal.some((item) => item.idEspecialidad === prev)) {
          return prev
        }

        return especialidadesSucursal[0]?.idEspecialidad ?? 0
      })
      setIdsServicios((prev) => {
        const seleccionVigente = prev.filter((idServicio) => result.servicios.some((servicio) => servicio.id === idServicio))
        if (seleccionVigente.length > 0) {
          return seleccionVigente
        }

        if (result.servicios.length === 1) {
          return [result.servicios[0].id]
        }

        return []
      })

      if (result.sucursales.length === 0) {
        setCatalogWarning("La clínica no tiene sucursales activas para agendar.")
      } else if (result.servicios.length === 0) {
        setCatalogWarning("La clínica no tiene servicios activos disponibles para agendar.")
      } else if (result.especialidadesPorSucursal.length === 0) {
        setCatalogWarning("La clínica no tiene especialidades configuradas por sucursal para agendar.")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar el catálogo"
      setCatalogError(message)
      setCatalogo(null)
      setCatalogWarning(null)
    } finally {
      setCatalogLoading(false)
    }
  }

  useEffect(() => {
    if (initialIdClinica > 0) {
      loadCatalogo(initialIdClinica)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!catalogo || idSucursal <= 0) {
      setIdEspecialidad(0)
      return
    }

    const especialidadesSucursal = catalogo.especialidadesPorSucursal.filter((item) => item.idSucursal === idSucursal)
    if (especialidadesSucursal.length === 0) {
      setIdEspecialidad(0)
      return
    }

    if (!especialidadesSucursal.some((item) => item.idEspecialidad === idEspecialidad)) {
      setIdEspecialidad(especialidadesSucursal[0].idEspecialidad)
    }
  }, [catalogo, idSucursal, idEspecialidad])

  useEffect(() => {
    const loadDisponibilidad = async () => {
      if (idClinica <= 0 || idSucursal <= 0 || idEspecialidad <= 0 || idsServicios.length === 0 || !fechaAgenda) {
        setDisponibilidad(null)
        setDisponibilidadError(null)
        setFechaHoraInicioPlan("")
        return
      }

      setDisponibilidadLoading(true)
      setDisponibilidadError(null)

      try {
        const result = await citaService.obtenerHorariosDisponiblesPublicos({
          idClinica,
          idSucursal,
          idEspecialidad,
          fecha: fechaAgenda,
          idsServicios,
        })

        setDisponibilidad(result)
        const cuposDisponibles = Math.max(0, result.citasMaximasPorDiaEspecialidad - result.citasOcupadasDiaEspecialidad)
        if (cuposDisponibles <= 0) {
          setDisponibilidadError("No hay cupos disponibles para esta especialidad en la fecha seleccionada.")
        }
        setFechaHoraInicioPlan((prev) => {
          const existeSeleccion = result.horarios.some(
            (horario) => toDateTimeLocalInputValue(horario.fechaHoraInicioPlan) === prev
          )

          if (existeSeleccion) {
            return prev
          }

          return result.horarios.length > 0
            ? toDateTimeLocalInputValue(result.horarios[0].fechaHoraInicioPlan)
            : ""
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo cargar la disponibilidad"
        setDisponibilidadError(message)
        setDisponibilidad(null)
        setFechaHoraInicioPlan("")
      } finally {
        setDisponibilidadLoading(false)
      }
    }

    loadDisponibilidad()
  }, [idClinica, idSucursal, idEspecialidad, idsServicios, fechaAgenda])

  const toggleServicio = (idServicio: number) => {
    setIdsServicios((prev) =>
      prev.includes(idServicio)
        ? prev.filter((id) => id !== idServicio)
        : [...prev, idServicio]
    )
  }

  const submitPublicAppointment = async () => {
    if (!canSubmit) {
      const message = "Completa los campos requeridos para agendar la cita."
      setSubmitError(message)
      showToast(message, "warning")
      return
    }

    if (cuposDisponiblesEspecialidad <= 0) {
      const message = "No hay cupos disponibles para esta especialidad en el día seleccionado."
      setSubmitError(message)
      showToast(message, "warning")
      return
    }

    setSubmitLoading(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const payload: CreateCitaPublicaDto = {
        idClinica,
        idSucursal,
        idEspecialidad,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim().toLowerCase(),
        telefono: telefono.trim(),
        fechaHoraInicioPlan: toIsoDateTime(fechaHoraInicioPlan),
        notas: notas.trim(),
        idsServicios,
      }

      const cita = await citaService.crearPublica(payload)
      const successMessage = `Tu cita #${cita.id} fue agendada exitosamente.`
      setSubmitSuccess(successMessage)
      showToast("Cita agendada. Revisa tu correo de confirmación.", "success")

      setFechaHoraInicioPlan("")
      setIdsServicios([])
      setNotas("")
      setDisponibilidad(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo agendar la cita"
      setSubmitError(message)
      showToast(message, "error")
    } finally {
      setSubmitLoading(false)
    }
  }

  return {
    idClinica,
    setIdClinica,
    idClinicaInput,
    setIdClinicaInput,
    catalogo,
    catalogLoading,
    catalogError,
    catalogWarning,
    loadCatalogo,
    nombres,
    setNombres,
    apellidos,
    setApellidos,
    correo,
    setCorreo,
    telefono,
    setTelefono,
    fechaHoraInicioPlan,
    setFechaHoraInicioPlan,
    fechaAgenda,
    setFechaAgenda,
    idSucursal,
    setIdSucursal,
    idEspecialidad,
    setIdEspecialidad,
    idsServicios,
    toggleServicio,
    disponibilidad,
    cuposDisponiblesEspecialidad,
    disponibilidadLoading,
    disponibilidadError,
    notas,
    setNotas,
    submitLoading,
    submitError,
    submitSuccess,
    submitPublicAppointment,
    canSubmit,
  }
}
