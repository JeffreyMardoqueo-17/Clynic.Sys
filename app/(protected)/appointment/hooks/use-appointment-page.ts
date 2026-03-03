"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { normalizeRole } from "@/lib/authorization"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { citaService } from "@/services/cita.service"
import { historialClinicoService } from "@/services/historial-clinico.service"
import { pacienteService } from "@/services/paciente.service"
import { servicioService } from "@/services/servicio.service"
import { sucursalService } from "@/services/sucursal.service"
import { usuarioService } from "@/services/usuario.service"
import { CitaResponseDto, EstadoCita } from "@/types/cita"
import { HistorialClinicoResponseDto } from "@/types/historial-clinico"
import { PacienteResponseDto } from "@/types/paciente"
import { ServicioResponseDto } from "@/types/servicio"
import { SucursalResponseDto } from "@/types/sucursal"
import { UsuarioResponseDto } from "@/types/usuario"

function toIsoDateTime(localDateTime: string) {
  if (!localDateTime) {
    return localDateTime
  }

  return localDateTime.length === 16 ? `${localDateTime}:00` : localDateTime
}

export function useAppointmentPage() {
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [idClinica, setIdClinica] = useState(0)
  const [idUsuario, setIdUsuario] = useState(0)
  const [idSucursalUsuario, setIdSucursalUsuario] = useState<number | null>(null)
  const [role, setRole] = useState<"Admin" | "Doctor" | "Recepcionista" | "Unknown">("Unknown")

  const [citas, setCitas] = useState<CitaResponseDto[]>([])
  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [pacientes, setPacientes] = useState<PacienteResponseDto[]>([])
  const [servicios, setServicios] = useState<ServicioResponseDto[]>([])
  const [doctores, setDoctores] = useState<UsuarioResponseDto[]>([])

  const [idSucursalFiltro, setIdSucursalFiltro] = useState<number | "all">("all")
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCita | "all">("all")

  const [createLoading, setCreateLoading] = useState(false)
  const [idSucursalCrear, setIdSucursalCrear] = useState(0)
  const [idPacienteCrear, setIdPacienteCrear] = useState(0)
  const [idDoctorCrear, setIdDoctorCrear] = useState<number | "none">("none")
  const [fechaHoraCrear, setFechaHoraCrear] = useState("")
  const [idsServiciosCrear, setIdsServiciosCrear] = useState<number[]>([])
  const [estadoInicialCrear, setEstadoInicialCrear] = useState<EstadoCita>(2)
  const [notasCrear, setNotasCrear] = useState("")

  const [asignarLoading, setAsignarLoading] = useState(false)
  const [estadoLoadingId, setEstadoLoadingId] = useState<number | null>(null)

  const [idCitaConsulta, setIdCitaConsulta] = useState(0)
  const [idCitaDoctorActiva, setIdCitaDoctorActiva] = useState(0)
  const [diagnostico, setDiagnostico] = useState("")
  const [tratamiento, setTratamiento] = useState("")
  const [receta, setReceta] = useState("")
  const [examenes, setExamenes] = useState("")
  const [notasMedicas, setNotasMedicas] = useState("")
  const [consultaLoading, setConsultaLoading] = useState(false)

  const [historialActual, setHistorialActual] = useState<HistorialClinicoResponseDto | null>(null)
  const [historialLoading, setHistorialLoading] = useState(false)
  const [historialSaving, setHistorialSaving] = useState(false)
  const [formHistorial, setFormHistorial] = useState({
    enfermedadesPrevias: "",
    medicamentosActuales: "",
    alergias: "",
    antecedentesFamiliares: "",
    observaciones: "",
  })

  const canCreateInternal = role === "Admin" || role === "Recepcionista"
  const canRegisterConsult = role === "Admin" || role === "Doctor"
  const canFilterBySucursal = role === "Admin"

  const loadCitas = useCallback(async () => {
    if (!idClinica) return

    try {
      const idSucursalConsulta = role === "Admin"
        ? (idSucursalFiltro === "all" ? undefined : idSucursalFiltro)
        : (idSucursalUsuario ?? undefined)

      const result = await citaService.obtenerPorClinica(idClinica, {
        idSucursal: idSucursalConsulta,
        estado: estadoFiltro === "all" ? undefined : estadoFiltro,
      })
      setCitas(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las citas")
    }
  }, [idClinica, idSucursalFiltro, estadoFiltro, role, idSucursalUsuario])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const profile = await authService.getProfile()
      const normalizedRole = normalizeRole(profile.rol)
      setRole(normalizedRole)
      setIdClinica(profile.idClinica)
      setIdUsuario(profile.id)
      setIdSucursalUsuario(profile.idSucursal ?? null)

      const aplicarFiltroSucursal = normalizedRole !== "Admin" && !!profile.idSucursal
      const idSucursalForzada = aplicarFiltroSucursal ? profile.idSucursal : undefined

      const usuariosPromise = idSucursalForzada
        ? usuarioService.obtenerPorClinicaYSucursal(profile.idClinica, idSucursalForzada)
        : usuarioService.obtenerPorClinica(profile.idClinica)

      const [sucursalesData, serviciosData, pacientesData, citasData, usuariosClinica] = await Promise.all([
        sucursalService.obtenerPorClinica(profile.idClinica),
        servicioService.obtenerPorClinica(profile.idClinica),
        pacienteService.obtenerPorClinica(profile.idClinica),
        citaService.obtenerPorClinica(profile.idClinica, {
          idSucursal: idSucursalForzada,
        }),
        usuariosPromise,
      ])

      setSucursales(sucursalesData)
      setServicios(serviciosData.filter((s) => s.activo))
      setPacientes(pacientesData)
      setCitas(citasData)
      setDoctores(usuariosClinica.filter((usuario) => usuario.rol === 2 && usuario.activo))

      if (idSucursalForzada) {
        setIdSucursalFiltro(idSucursalForzada)
        setIdSucursalCrear(idSucursalForzada)
      } else {
        setIdSucursalCrear(sucursalesData[0]?.id ?? 0)
      }

      setIdPacienteCrear(pacientesData[0]?.id ?? 0)
      setIdCitaConsulta(citasData.find((c) => !c.consultaMedica && c.estado !== 3)?.id ?? 0)

      const citaDoctorInicial = citasData
        .filter((cita) => cita.estado === 6 && !cita.consultaMedica && (normalizedRole !== "Doctor" || cita.idDoctor === profile.id))
        .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())[0]

      if (citaDoctorInicial) {
        setIdCitaDoctorActiva(citaDoctorInicial.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la vista de citas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (idClinica) {
      loadCitas()
    }
  }, [idClinica, idSucursalFiltro, estadoFiltro, loadCitas])

  const toggleServicioCrear = (idServicio: number) => {
    setIdsServiciosCrear((prev) =>
      prev.includes(idServicio)
        ? prev.filter((id) => id !== idServicio)
        : [...prev, idServicio]
    )
  }

  const crearCitaInterna = async () => {
    if (!canCreateInternal) {
      showToast("No tienes permisos para crear citas internas", "warning")
      return
    }

    if (!idClinica || !idSucursalCrear || !idPacienteCrear || !fechaHoraCrear || idsServiciosCrear.length === 0) {
      showToast("Completa los campos obligatorios para crear la cita", "warning")
      return
    }

    setCreateLoading(true)
    setError(null)

    try {
      await citaService.crearInterna({
        idClinica,
        idSucursal: idSucursalCrear,
        idPaciente: idPacienteCrear,
        idDoctor: idDoctorCrear === "none" ? undefined : idDoctorCrear,
        fechaHoraInicioPlan: toIsoDateTime(fechaHoraCrear),
        idsServicios: idsServiciosCrear,
        estadoInicial: estadoInicialCrear,
        notas: notasCrear.trim(),
      })

      showToast("Cita interna creada correctamente", "success")
      setFechaHoraCrear("")
      setIdsServiciosCrear([])
      setNotasCrear("")
      await loadCitas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear la cita"
      setError(message)
      showToast(message, "error")
    } finally {
      setCreateLoading(false)
    }
  }

  const asignarDoctor = async (idCita: number, idDoctor?: number) => {
    setAsignarLoading(true)
    setError(null)

    try {
      await citaService.asignarDoctor(idCita, { idDoctor })
      showToast("Doctor asignado correctamente", "success")
      await loadCitas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo asignar doctor"
      setError(message)
      showToast(message, "error")
    } finally {
      setAsignarLoading(false)
    }
  }

  const cambiarEstado = async (idCita: number, nuevoEstado: EstadoCita, notasOperacion?: string) => {
    setEstadoLoadingId(idCita)
    setError(null)

    try {
      await citaService.cambiarEstado(idCita, { nuevoEstado, notasOperacion })
      showToast("Estado de cita actualizado", "success")
      await loadCitas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cambiar el estado"
      // Si el error parece relacionado con la fecha / día de la cita, mostrar advertencia en vez de error
      const lower = message.toLowerCase()
      const isDateProblem = /fecha|día|dia|programad|no corresponde|no es el dia|horario|fuera de/.test(lower)

      if (isDateProblem) {
        showToast(message, "warning")
      } else {
        setError(message)
        showToast(message, "error")
      }
    } finally {
      setEstadoLoadingId(null)
    }
  }

  const marcarPresente = async (idCita: number) => {
    await cambiarEstado(idCita, 5, "Paciente presente en recepción")
  }

  const pasarAConsulta = async (idCita: number) => {
    await cambiarEstado(idCita, 6, "Paciente derivado a consulta médica")
  }

  const registrarConsultaPorCita = async (idCitaObjetivo: number) => {
    if (!canRegisterConsult) {
      showToast("No tienes permisos para registrar consultas", "warning")
      return
    }

    if (!idCitaObjetivo || diagnostico.trim().length < 3) {
      showToast("Selecciona una cita y agrega un diagnóstico válido", "warning")
      return
    }

    setConsultaLoading(true)
    setError(null)

    try {
      await citaService.registrarConsulta(idCitaObjetivo, {
        diagnostico: diagnostico.trim(),
        tratamiento: tratamiento.trim(),
        receta: receta.trim(),
        examenesSolicitados: examenes.trim(),
        notasMedicas: notasMedicas.trim(),
      })

      showToast("Consulta registrada correctamente", "success")
      setDiagnostico("")
      setTratamiento("")
      setReceta("")
      setExamenes("")
      setNotasMedicas("")
      await loadCitas()
      setIdCitaDoctorActiva(0)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo registrar la consulta"
      setError(message)
      showToast(message, "error")
    } finally {
      setConsultaLoading(false)
    }
  }

  const registrarConsulta = async () => {
    await registrarConsultaPorCita(idCitaConsulta)
  }

  const agendarSeguimiento = async (idCitaBase: number, fechaHoraSeguimiento: string) => {
    if (!canCreateInternal) {
      showToast("No tienes permisos para agendar seguimiento", "warning")
      return
    }

    if (!fechaHoraSeguimiento) {
      showToast("Selecciona fecha y hora para la nueva cita de seguimiento", "warning")
      return
    }

    const citaBase = citas.find((cita) => cita.id === idCitaBase)
    if (!citaBase) {
      showToast("No se encontró la cita base para seguimiento", "error")
      return
    }

    const idsServiciosSeguimiento = [...new Set(citaBase.servicios.map((servicio) => servicio.idServicio))]
    if (idsServiciosSeguimiento.length === 0) {
      showToast("La cita base no tiene servicios para reutilizar en seguimiento", "warning")
      return
    }

    setCreateLoading(true)
    setError(null)

    try {
      const notasSeguimientoBase = `Seguimiento de cita #${citaBase.id}. ${citaBase.consultaMedica?.notasMedicas ?? ""}`.trim()
      const notasSeguimiento = notasSeguimientoBase.slice(0, 250)

      await citaService.crearInterna({
        idClinica,
        idSucursal: citaBase.idSucursal,
        idPaciente: citaBase.idPaciente,
        idDoctor: citaBase.idDoctor,
        fechaHoraInicioPlan: toIsoDateTime(fechaHoraSeguimiento),
        idsServicios: idsServiciosSeguimiento,
        estadoInicial: 2,
        notas: notasSeguimiento,
      })

      showToast("Cita de seguimiento creada correctamente", "success")
      await loadCitas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear la cita de seguimiento"
      setError(message)
      showToast(message, "error")
    } finally {
      setCreateLoading(false)
    }
  }

  const citasSinConsulta = useMemo(
    () => citas.filter((cita) => !cita.consultaMedica && cita.estado !== 3),
    [citas]
  )

  const citasDoctorEnConsulta = useMemo(() => {
    if (role !== "Doctor") {
      return []
    }

    return [...citas]
      .filter((cita) => cita.estado === 6 && !cita.consultaMedica && cita.idDoctor === idUsuario)
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())
  }, [citas, role, idUsuario])

  const siguienteCitaDoctor = useMemo(
    () => citasDoctorEnConsulta[0] ?? null,
    [citasDoctorEnConsulta]
  )

  const citaDoctorActiva = useMemo(() => {
    if (!idCitaDoctorActiva) {
      return siguienteCitaDoctor
    }

    return citas.find((cita) => cita.id === idCitaDoctorActiva) ?? siguienteCitaDoctor
  }, [idCitaDoctorActiva, citas, siguienteCitaDoctor])

  const cargarHistorialPaciente = useCallback(async (idPaciente: number) => {
    if (!idPaciente) {
      setHistorialActual(null)
      setFormHistorial({
        enfermedadesPrevias: "",
        medicamentosActuales: "",
        alergias: "",
        antecedentesFamiliares: "",
        observaciones: "",
      })
      return
    }

    setHistorialLoading(true)
    try {
      const historial = await historialClinicoService.obtenerPorPaciente(idPaciente)
      setHistorialActual(historial)
      setFormHistorial({
        enfermedadesPrevias: historial.enfermedadesPrevias ?? "",
        medicamentosActuales: historial.medicamentosActuales ?? "",
        alergias: historial.alergias ?? "",
        antecedentesFamiliares: historial.antecedentesFamiliares ?? "",
        observaciones: historial.observaciones ?? "",
      })
    } catch {
      setHistorialActual(null)
      setFormHistorial({
        enfermedadesPrevias: "",
        medicamentosActuales: "",
        alergias: "",
        antecedentesFamiliares: "",
        observaciones: "",
      })
    } finally {
      setHistorialLoading(false)
    }
  }, [])

  const abrirCitaDoctor = useCallback(async (idCita: number) => {
    setIdCitaDoctorActiva(idCita)
    const cita = citas.find((item) => item.id === idCita)
    if (cita) {
      setIdCitaConsulta(cita.id)
      await cargarHistorialPaciente(cita.idPaciente)
    }
  }, [cargarHistorialPaciente, citas])

  const guardarHistorialPaciente = async () => {
    if (!(role === "Admin" || role === "Doctor")) {
      showToast("No tienes permisos para guardar historial clínico", "warning")
      return
    }

    if (!citaDoctorActiva) {
      showToast("Selecciona una cita para editar historial", "warning")
      return
    }

    setHistorialSaving(true)
    try {
      const saved = await historialClinicoService.guardar(citaDoctorActiva.idPaciente, {
        enfermedadesPrevias: formHistorial.enfermedadesPrevias.trim(),
        medicamentosActuales: formHistorial.medicamentosActuales.trim(),
        alergias: formHistorial.alergias.trim(),
        antecedentesFamiliares: formHistorial.antecedentesFamiliares.trim(),
        observaciones: formHistorial.observaciones.trim(),
      })

      setHistorialActual(saved)
      showToast("Historial clínico guardado", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar el historial clínico"
      setError(message)
      showToast(message, "error")
    } finally {
      setHistorialSaving(false)
    }
  }

  return {
    loading,
    error,
    role,
    idUsuario,
    idSucursalUsuario,
    canCreateInternal,
    canRegisterConsult,
    canFilterBySucursal,
    citas,
    sucursales,
    pacientes,
    servicios,
    doctores,
    idSucursalFiltro,
    setIdSucursalFiltro,
    estadoFiltro,
    setEstadoFiltro,
    createLoading,
    idSucursalCrear,
    setIdSucursalCrear,
    idPacienteCrear,
    setIdPacienteCrear,
    idDoctorCrear,
    setIdDoctorCrear,
    fechaHoraCrear,
    setFechaHoraCrear,
    idsServiciosCrear,
    toggleServicioCrear,
    estadoInicialCrear,
    setEstadoInicialCrear,
    notasCrear,
    setNotasCrear,
    crearCitaInterna,
    asignarLoading,
    asignarDoctor,
    estadoLoadingId,
    cambiarEstado,
    marcarPresente,
    pasarAConsulta,
    citasSinConsulta,
    idCitaConsulta,
    setIdCitaConsulta,
    diagnostico,
    setDiagnostico,
    tratamiento,
    setTratamiento,
    receta,
    setReceta,
    examenes,
    setExamenes,
    notasMedicas,
    setNotasMedicas,
    consultaLoading,
    registrarConsulta,
    registrarConsultaPorCita,
    agendarSeguimiento,
    citasDoctorEnConsulta,
    siguienteCitaDoctor,
    citaDoctorActiva,
    abrirCitaDoctor,
    historialActual,
    historialLoading,
    historialSaving,
    formHistorial,
    setFormHistorial,
    guardarHistorialPaciente,
  }
}
