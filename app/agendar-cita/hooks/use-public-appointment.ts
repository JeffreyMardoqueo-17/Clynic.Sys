"use client"

import { useEffect, useMemo, useState } from "react"
import { citaService } from "@/services/cita.service"
import { useToast } from "@/hooks/use-toast"
import { CatalogoCitaPublicaDto, CreateCitaPublicaDto } from "@/types/cita"

function toIsoDateTime(localDateTime: string) {
  if (!localDateTime) {
    return localDateTime
  }

  return localDateTime.length === 16 ? `${localDateTime}:00` : localDateTime
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

  const [nombres, setNombres] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [correo, setCorreo] = useState("")
  const [telefono, setTelefono] = useState("")
  const [fechaHoraInicioPlan, setFechaHoraInicioPlan] = useState("")
  const [idSucursal, setIdSucursal] = useState<number>(0)
  const [idsServicios, setIdsServicios] = useState<number[]>([])
  const [notas, setNotas] = useState("")

  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
      idClinica > 0 &&
      idSucursal > 0 &&
      idsServicios.length > 0 &&
      nombres.trim().length >= 2 &&
      apellidos.trim().length >= 2 &&
      correo.trim().length > 4 &&
      fechaHoraInicioPlan.trim().length > 0
    )
  }, [idClinica, idSucursal, idsServicios, nombres, apellidos, correo, fechaHoraInicioPlan])

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
      setIdsServicios((prev) => prev.filter((idServicio) => result.servicios.some((servicio) => servicio.id === idServicio)))
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar el catálogo"
      setCatalogError(message)
      setCatalogo(null)
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

    setSubmitLoading(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const payload: CreateCitaPublicaDto = {
        idClinica,
        idSucursal,
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
    idSucursal,
    setIdSucursal,
    idsServicios,
    toggleServicio,
    notas,
    setNotas,
    submitLoading,
    submitError,
    submitSuccess,
    submitPublicAppointment,
    canSubmit,
  }
}
