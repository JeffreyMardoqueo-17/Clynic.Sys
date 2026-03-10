"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { normalizeRole } from "@/lib/authorization"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { citaService } from "@/services/cita.service"
import { historialClinicoService } from "@/services/historial-clinico.service"
import { pacienteService } from "@/services/paciente.service"
import { servicioService } from "@/services/servicio.service"
import { sucursalService } from "@/services/sucursal.service"
import { doctorRealtimeService } from "@/services/doctor-realtime.service"
import { usuarioService } from "@/services/usuario.service"
import { CatalogoEspecialidadSucursalDto, CitaActividadResponseDto, CitaResponseDto, EstadoCita, HorariosDisponiblesCitaDto } from "@/types/cita"
import { HistorialClinicoResponseDto } from "@/types/historial-clinico"
import { CreatePacienteDto, PacienteResponseDto } from "@/types/paciente"
import { ServicioResponseDto } from "@/types/servicio"
import { SucursalResponseDto } from "@/types/sucursal"
import { UsuarioResponseDto } from "@/types/usuario"

const APPOINTMENT_DRAFT_KEY = "clynic:appointment:draft:v1"

function toIsoDateTime(localDateTime: string) {
  if (!localDateTime) {
    return localDateTime
  }

  return localDateTime.length === 16 ? `${localDateTime}:00` : localDateTime
}

function toDateTimeQuery(date: Date, endOfDay = false) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return endOfDay ? `${year}-${month}-${day}T23:59:59` : `${year}-${month}-${day}T00:00:00`
}

function getTodayQueryRange() {
  const today = new Date()
  return {
    fechaDesde: toDateTimeQuery(today, false),
    fechaHasta: toDateTimeQuery(today, true),
  }
}

export function useAppointmentPage() {
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [idClinica, setIdClinica] = useState(0)
  const [idUsuario, setIdUsuario] = useState(0)
  const [idEspecialidadUsuario, setIdEspecialidadUsuario] = useState<number | null>(null)
  const [idSucursalUsuario, setIdSucursalUsuario] = useState<number | null>(null)
  const [role, setRole] = useState<"Admin" | "Doctor" | "Recepcionista" | "Unknown">("Unknown")

  const [citas, setCitas] = useState<CitaResponseDto[]>([])
  const [citasTodas, setCitasTodas] = useState<CitaResponseDto[]>([])
  const [actividadCitas, setActividadCitas] = useState<CitaActividadResponseDto[]>([])
  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [pacientes, setPacientes] = useState<PacienteResponseDto[]>([])
  const [servicios, setServicios] = useState<ServicioResponseDto[]>([])
  const [doctores, setDoctores] = useState<UsuarioResponseDto[]>([])

  const [idSucursalFiltro, setIdSucursalFiltro] = useState<number | "all">("all")
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCita | "all">("all")

  const [createLoading, setCreateLoading] = useState(false)
  const [crearPacienteLoading, setCrearPacienteLoading] = useState(false)
  const [idSucursalCrear, setIdSucursalCrear] = useState(0)
  const [idEspecialidadCrear, setIdEspecialidadCrear] = useState(0)
  const [idPacienteCrear, setIdPacienteCrear] = useState(0)
  const [formNuevoPaciente, setFormNuevoPaciente] = useState<CreatePacienteDto>({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    fechaNacimiento: "",
  })
  const [idDoctorCrear, setIdDoctorCrear] = useState<number | "none">("none")
  const [fechaHoraCrear, setFechaHoraCrear] = useState("")
  const [idsServiciosCrear, setIdsServiciosCrear] = useState<number[]>([])
  const [estadoInicialCrear, setEstadoInicialCrear] = useState<EstadoCita>(2)
  const [notasCrear, setNotasCrear] = useState("")
  const [especialidadesPorSucursal, setEspecialidadesPorSucursal] = useState<CatalogoEspecialidadSucursalDto[]>([])
  const [disponibilidadCrear, setDisponibilidadCrear] = useState<HorariosDisponiblesCitaDto | null>(null)
  const [disponibilidadCrearLoading, setDisponibilidadCrearLoading] = useState(false)

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
  const [tomandoSiguienteDoctor, setTomandoSiguienteDoctor] = useState(false)

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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(APPOINTMENT_DRAFT_KEY)
      if (!raw) {
        return
      }

      const draft = JSON.parse(raw) as {
        idSucursalCrear?: number
        idEspecialidadCrear?: number
        idPacienteCrear?: number
        formNuevoPaciente?: CreatePacienteDto
        idDoctorCrear?: number | "none"
        fechaHoraCrear?: string
        idsServiciosCrear?: number[]
        estadoInicialCrear?: EstadoCita
        notasCrear?: string
        idCitaConsulta?: number
        idCitaDoctorActiva?: number
        diagnostico?: string
        tratamiento?: string
        receta?: string
        examenes?: string
        notasMedicas?: string
        formHistorial?: {
          enfermedadesPrevias?: string
          medicamentosActuales?: string
          alergias?: string
          antecedentesFamiliares?: string
          observaciones?: string
        }
      }

      if (typeof draft.idSucursalCrear === "number") setIdSucursalCrear(draft.idSucursalCrear)
      if (typeof draft.idEspecialidadCrear === "number") setIdEspecialidadCrear(draft.idEspecialidadCrear)
      if (typeof draft.idPacienteCrear === "number") setIdPacienteCrear(draft.idPacienteCrear)
      if (draft.formNuevoPaciente) {
        setFormNuevoPaciente({
          nombres: draft.formNuevoPaciente.nombres ?? "",
          apellidos: draft.formNuevoPaciente.apellidos ?? "",
          correo: draft.formNuevoPaciente.correo ?? "",
          telefono: draft.formNuevoPaciente.telefono ?? "",
          fechaNacimiento: draft.formNuevoPaciente.fechaNacimiento ?? "",
        })
      }
      if (draft.idDoctorCrear === "none" || typeof draft.idDoctorCrear === "number") setIdDoctorCrear(draft.idDoctorCrear)
      if (typeof draft.fechaHoraCrear === "string") setFechaHoraCrear(draft.fechaHoraCrear)
      if (Array.isArray(draft.idsServiciosCrear)) setIdsServiciosCrear(draft.idsServiciosCrear)
      if (typeof draft.estadoInicialCrear === "number") setEstadoInicialCrear(draft.estadoInicialCrear)
      if (typeof draft.notasCrear === "string") setNotasCrear(draft.notasCrear)
      if (typeof draft.idCitaConsulta === "number") setIdCitaConsulta(draft.idCitaConsulta)
      if (typeof draft.idCitaDoctorActiva === "number") setIdCitaDoctorActiva(draft.idCitaDoctorActiva)
      if (typeof draft.diagnostico === "string") setDiagnostico(draft.diagnostico)
      if (typeof draft.tratamiento === "string") setTratamiento(draft.tratamiento)
      if (typeof draft.receta === "string") setReceta(draft.receta)
      if (typeof draft.examenes === "string") setExamenes(draft.examenes)
      if (typeof draft.notasMedicas === "string") setNotasMedicas(draft.notasMedicas)

      if (draft.formHistorial) {
        setFormHistorial({
          enfermedadesPrevias: draft.formHistorial.enfermedadesPrevias ?? "",
          medicamentosActuales: draft.formHistorial.medicamentosActuales ?? "",
          alergias: draft.formHistorial.alergias ?? "",
          antecedentesFamiliares: draft.formHistorial.antecedentesFamiliares ?? "",
          observaciones: draft.formHistorial.observaciones ?? "",
        })
      }
    } catch {
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      APPOINTMENT_DRAFT_KEY,
      JSON.stringify({
        idSucursalCrear,
        idEspecialidadCrear,
        idPacienteCrear,
        formNuevoPaciente,
        idDoctorCrear,
        fechaHoraCrear,
        idsServiciosCrear,
        estadoInicialCrear,
        notasCrear,
        idCitaConsulta,
        idCitaDoctorActiva,
        diagnostico,
        tratamiento,
        receta,
        examenes,
        notasMedicas,
        formHistorial,
      })
    )
  }, [
    idSucursalCrear,
    idEspecialidadCrear,
    idPacienteCrear,
    formNuevoPaciente,
    idDoctorCrear,
    fechaHoraCrear,
    idsServiciosCrear,
    estadoInicialCrear,
    notasCrear,
    idCitaConsulta,
    idCitaDoctorActiva,
    diagnostico,
    tratamiento,
    receta,
    examenes,
    notasMedicas,
    formHistorial,
  ])

  const loadCitas = useCallback(async () => {
    if (!idClinica) return

    try {
      const todayRange = getTodayQueryRange()
      const idSucursalConsulta = role === "Admin"
        ? (idSucursalFiltro === "all" ? undefined : idSucursalFiltro)
        : (idSucursalUsuario ?? undefined)

      const [citasHoy, citasCompletas, actividad] = await Promise.all([
        citaService.obtenerPorClinica(idClinica, {
          fechaDesde: todayRange.fechaDesde,
          fechaHasta: todayRange.fechaHasta,
          idSucursal: idSucursalConsulta,
          estado: estadoFiltro === "all" ? undefined : estadoFiltro,
        }),
        citaService.obtenerPorClinica(idClinica, {
          idSucursal: idSucursalConsulta,
          estado: estadoFiltro === "all" ? undefined : estadoFiltro,
        }),
        citaService.obtenerActividadPorClinica(idClinica, {
          maxResultados: 80,
        }),
      ])

      setCitas(citasHoy)
      setCitasTodas(citasCompletas)
      setActividadCitas(actividad)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las citas")
    }
  }, [idClinica, idSucursalFiltro, estadoFiltro, role, idSucursalUsuario])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const profile = await authService.getProfile()
      const normalizedRole = normalizeRole(profile.nombreRol ?? profile.rol ?? profile.idRol)
      setRole(normalizedRole)
      setIdClinica(profile.idClinica)
      setIdUsuario(profile.id)
      setIdEspecialidadUsuario(profile.idEspecialidad ?? null)
      setIdSucursalUsuario(profile.idSucursal ?? null)

      const aplicarFiltroSucursal = normalizedRole !== "Admin" && !!profile.idSucursal
      const idSucursalForzada = aplicarFiltroSucursal ? profile.idSucursal : undefined

      const usuariosPromise = idSucursalForzada
        ? usuarioService.obtenerPorClinicaYSucursal(profile.idClinica, idSucursalForzada)
        : usuarioService.obtenerPorClinica(profile.idClinica)

      const todayRange = getTodayQueryRange()

      const [sucursalesData, serviciosData, pacientesData, citasHoyData, citasCompletasData, usuariosClinica, catalogoCitas, actividad] = await Promise.all([
        sucursalService.obtenerPorClinica(profile.idClinica),
        servicioService.obtenerPorClinica(profile.idClinica),
        pacienteService.obtenerPorClinica(profile.idClinica),
        citaService.obtenerPorClinica(profile.idClinica, {
          fechaDesde: todayRange.fechaDesde,
          fechaHasta: todayRange.fechaHasta,
          idSucursal: idSucursalForzada,
        }),
        citaService.obtenerPorClinica(profile.idClinica, {
          idSucursal: idSucursalForzada,
        }),
        usuariosPromise,
        citaService.obtenerCatalogoPublico(profile.idClinica),
        citaService.obtenerActividadPorClinica(profile.idClinica, { maxResultados: 80 }),
      ])

      setSucursales(sucursalesData)
      setServicios(serviciosData.filter((s) => s.activo))
      setPacientes(pacientesData)
      setCitas(citasHoyData)
      setCitasTodas(citasCompletasData)
      setActividadCitas(actividad)
      const especialidadesCatalogo = Array.isArray(catalogoCitas?.especialidadesPorSucursal)
        ? catalogoCitas.especialidadesPorSucursal
        : []

      setEspecialidadesPorSucursal(especialidadesCatalogo)
      setDoctores(usuariosClinica.filter((usuario) => usuario.idRol === 2 && usuario.activo))

      if (idSucursalForzada) {
        setIdSucursalFiltro(idSucursalForzada)
        setIdSucursalCrear(idSucursalForzada)
      } else {
        setIdSucursalCrear(sucursalesData[0]?.id ?? 0)
      }

      const sucursalInicial = idSucursalForzada ?? sucursalesData[0]?.id
      const especialidadInicial = especialidadesCatalogo.find((item) => item.idSucursal === sucursalInicial)
      setIdEspecialidadCrear(especialidadInicial?.idEspecialidad ?? 0)

      setIdPacienteCrear(pacientesData[0]?.id ?? 0)
      setIdCitaConsulta(citasHoyData.find((c) => !c.consultaMedica && c.estado !== 3)?.id ?? 0)

      setIdCitaDoctorActiva(0)
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

  const loadCitasRealtimeRef = useRef(loadCitas)
  useEffect(() => {
    loadCitasRealtimeRef.current = loadCitas
  }, [loadCitas])

  useEffect(() => {
    if (!idClinica || role === "Unknown") {
      return
    }

    let active = true

    doctorRealtimeService
      .connect(
        undefined,
        async () => {
          if (!active) return
          await loadCitasRealtimeRef.current()
        }
      )
      .catch(() => {})

    return () => {
      active = false
      doctorRealtimeService.disconnect().catch(() => {})
    }
  }, [idClinica, role])

  useEffect(() => {
    if (!idClinica) {
      return
    }

    const interval = window.setInterval(() => {
      loadCitas().catch(() => {})
    }, 10000)

    return () => window.clearInterval(interval)
  }, [idClinica, loadCitas])

  const especialidadesDisponiblesCrear = useMemo(
    () => especialidadesPorSucursal.filter((item) => item.idSucursal === idSucursalCrear),
    [especialidadesPorSucursal, idSucursalCrear]
  )

  const cuposDisponiblesCrear = useMemo(() => {
    if (!disponibilidadCrear) return 0
    return Math.max(0, disponibilidadCrear.citasMaximasPorDiaEspecialidad - disponibilidadCrear.citasOcupadasDiaEspecialidad)
  }, [disponibilidadCrear])

  const doctoresDisponiblesCrear = useMemo(() => {
    if (!idEspecialidadCrear) return doctores
    return doctores.filter((doctor) => !doctor.idEspecialidad || doctor.idEspecialidad === idEspecialidadCrear)
  }, [doctores, idEspecialidadCrear])

  useEffect(() => {
    if (idDoctorCrear === "none") return
    if (!doctoresDisponiblesCrear.some((doctor) => doctor.id === idDoctorCrear)) {
      setIdDoctorCrear("none")
    }
  }, [idDoctorCrear, doctoresDisponiblesCrear])

  useEffect(() => {
    if (!especialidadesDisponiblesCrear.length) {
      setIdEspecialidadCrear(0)
      return
    }

    if (!especialidadesDisponiblesCrear.some((item) => item.idEspecialidad === idEspecialidadCrear)) {
      setIdEspecialidadCrear(especialidadesDisponiblesCrear[0].idEspecialidad)
    }
  }, [especialidadesDisponiblesCrear, idEspecialidadCrear])

  useEffect(() => {
    const loadDisponibilidadCrear = async () => {
      if (!idClinica || !idSucursalCrear || !idEspecialidadCrear || !fechaHoraCrear || idsServiciosCrear.length === 0) {
        setDisponibilidadCrear(null)
        return
      }

      setDisponibilidadCrearLoading(true)
      try {
        const fecha = fechaHoraCrear.slice(0, 10)
        const result = await citaService.obtenerHorariosDisponiblesPublicos({
          idClinica,
          idSucursal: idSucursalCrear,
          idEspecialidad: idEspecialidadCrear,
          fecha,
          idsServicios: idsServiciosCrear,
        })
        setDisponibilidadCrear(result)
      } catch {
        setDisponibilidadCrear(null)
      } finally {
        setDisponibilidadCrearLoading(false)
      }
    }

    loadDisponibilidadCrear()
  }, [idClinica, idSucursalCrear, idEspecialidadCrear, fechaHoraCrear, idsServiciosCrear])

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

    if (!idClinica || !idSucursalCrear || !idEspecialidadCrear || !idPacienteCrear || !fechaHoraCrear || idsServiciosCrear.length === 0) {
      showToast("Completa los campos obligatorios para crear la cita", "warning")
      return
    }

    if (disponibilidadCrear && cuposDisponiblesCrear <= 0) {
      showToast("No hay cupos disponibles para esta especialidad en la fecha seleccionada", "warning")
      return
    }

    setCreateLoading(true)
    setError(null)

    try {
      await citaService.crearInterna({
        idClinica,
        idSucursal: idSucursalCrear,
        idPaciente: idPacienteCrear,
        idEspecialidad: idEspecialidadCrear,
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

  const registrarPacienteRapido = async () => {
    if (!canCreateInternal) {
      showToast("No tienes permisos para registrar pacientes", "warning")
      return
    }

    const nombres = formNuevoPaciente.nombres.trim()
    const apellidos = formNuevoPaciente.apellidos.trim()
    const correo = formNuevoPaciente.correo.trim().toLowerCase()
    const telefono = formNuevoPaciente.telefono?.trim() ?? ""
    const fechaNacimiento = formNuevoPaciente.fechaNacimiento?.trim() || undefined

    if (!idClinica || nombres.length < 2 || apellidos.length < 2 || !correo.includes("@")) {
      showToast("Completa nombres, apellidos y correo válido para registrar el paciente", "warning")
      return
    }

    setCrearPacienteLoading(true)
    setError(null)

    try {
      const creado = await pacienteService.crear(idClinica, {
        nombres,
        apellidos,
        correo,
        telefono,
        fechaNacimiento,
        idEspecialidad: idEspecialidadCrear || undefined,
      })

      setPacientes((prev) => {
        const next = [...prev.filter((p) => p.id !== creado.id), creado]
        next.sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto))
        return next
      })
      setIdPacienteCrear(creado.id)
      setFormNuevoPaciente({
        nombres: "",
        apellidos: "",
        correo: "",
        telefono: "",
        fechaNacimiento: "",
      })

      showToast("Paciente registrado y seleccionado para la cita", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo registrar el paciente"
      setError(message)
      showToast(message, "error")
    } finally {
      setCrearPacienteLoading(false)
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
    if (!(role === "Admin" || role === "Doctor")) {
      showToast("El pase a consulta lo realiza el doctor desde su cola", "warning")
      return
    }

    const cita = citas.find((item) => item.id === idCita)
    const nombreEspecialidad = cita?.nombreEspecialidad || "especialidad asignada"

    try {
      await cambiarEstado(idCita, 6, `Paciente enviado a consulta por ${nombreEspecialidad}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo pasar la cita a consulta"
      setError(message)
      showToast(message, "error")
    }
  }

  const registrarConsultaPorCita = async (idCitaObjetivo: number) => {
    if (!canRegisterConsult) {
      showToast("No tienes permisos para registrar consultas", "warning")
      return false
    }

    if (!idCitaObjetivo || diagnostico.trim().length < 3) {
      showToast("Selecciona una cita y agrega un diagnóstico válido", "warning")
      return false
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

      showToast("Consulta registrada. Recepción puede cerrar el proceso.", "success")
      setDiagnostico("")
      setTratamiento("")
      setReceta("")
      setExamenes("")
      setNotasMedicas("")
      await loadCitas()
      setIdCitaDoctorActiva(0)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo registrar la consulta"
      setError(message)
      showToast(message, "error")
      return false
    } finally {
      setConsultaLoading(false)
    }
  }

  const registrarConsulta = async () => {
    await registrarConsultaPorCita(idCitaConsulta)
  }

  const cerrarProcesoRecepcion = async (idCita: number) => {
    await cambiarEstado(idCita, 4, "Gracias por venir. Proceso de atención cerrado por recepción")
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
        idEspecialidad: citaBase.idEspecialidad,
        idDoctor: citaBase.idDoctor,
        fechaHoraInicioPlan: toIsoDateTime(fechaHoraSeguimiento),
        idsServicios: idsServiciosSeguimiento,
        estadoInicial: 2,
        notas: notasSeguimiento,
      })

      await citaService.cambiarEstado(citaBase.id, {
        nuevoEstado: 4,
        notasOperacion: "Seguimiento agendado. Proceso de atención cerrado por recepción",
      })

      showToast("Seguimiento agendado y proceso cerrado correctamente", "success")
      await loadCitas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear la cita de seguimiento"
      setError(message)
      showToast(message, "error")
    } finally {
      setCreateLoading(false)
    }
  }

  const reprogramarCita = async (idCita: number, nuevaFechaHoraInicioPlan: string, motivo?: string) => {
    if (!canCreateInternal) {
      showToast("No tienes permisos para reprogramar citas", "warning")
      return
    }

    if (!idCita || !nuevaFechaHoraInicioPlan) {
      showToast("Selecciona una fecha y hora válida para reprogramar", "warning")
      return
    }

    setEstadoLoadingId(idCita)
    setError(null)

    try {
      await citaService.reprogramar(idCita, {
        nuevaFechaHoraInicioPlan: toIsoDateTime(nuevaFechaHoraInicioPlan),
        motivo: motivo?.trim(),
      })

      showToast("Cita reprogramada correctamente", "success")
      await loadCitas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo reprogramar la cita"
      setError(message)
      showToast(message, "error")
    } finally {
      setEstadoLoadingId(null)
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

  const colaDoctorPendiente = useMemo(() => {
    if (role !== "Doctor") {
      return []
    }

    return [...citas]
      .filter((cita) => cita.estado === 5 && !cita.consultaMedica)
      .filter((cita) => !idEspecialidadUsuario || cita.idEspecialidad === idEspecialidadUsuario)
      .filter((cita) => !cita.idDoctor || cita.idDoctor === idUsuario)
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())
  }, [citas, role, idUsuario, idEspecialidadUsuario])

  const siguienteCitaDoctor = useMemo(
    () => colaDoctorPendiente[0] ?? null,
    [colaDoctorPendiente]
  )

  const tomarSiguientePacienteDoctor = async () => {
    if (role !== "Doctor") {
      showToast("Solo un doctor puede tomar el siguiente paciente", "warning")
      return
    }

    if (!siguienteCitaDoctor) {
      showToast("No hay pacientes en cola para ti", "warning")
      return
    }

    setTomandoSiguienteDoctor(true)
    try {
      await cambiarEstado(siguienteCitaDoctor.id, 6, "Paciente tomado por doctor en orden FIFO")
      setIdCitaDoctorActiva(siguienteCitaDoctor.id)
    } finally {
      setTomandoSiguienteDoctor(false)
    }
  }

  const citaDoctorActiva = useMemo(() => {
    if (!idCitaDoctorActiva) {
      return null
    }

    return citas.find((cita) => cita.id === idCitaDoctorActiva) ?? null
  }, [idCitaDoctorActiva, citas])

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
    idClinica,
    role,
    idUsuario,
    idEspecialidadUsuario,
    idSucursalUsuario,
    canCreateInternal,
    canRegisterConsult,
    canFilterBySucursal,
    citas,
    citasTodas,
    actividadCitas,
    sucursales,
    pacientes,
    servicios,
    doctores,
    idSucursalFiltro,
    setIdSucursalFiltro,
    estadoFiltro,
    setEstadoFiltro,
    createLoading,
    crearPacienteLoading,
    idSucursalCrear,
    setIdSucursalCrear,
    idEspecialidadCrear,
    setIdEspecialidadCrear,
    especialidadesDisponiblesCrear,
    disponibilidadCrear,
    disponibilidadCrearLoading,
    cuposDisponiblesCrear,
    idPacienteCrear,
    setIdPacienteCrear,
    formNuevoPaciente,
    setFormNuevoPaciente,
    registrarPacienteRapido,
    idDoctorCrear,
    setIdDoctorCrear,
    doctoresDisponiblesCrear,
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
    cerrarProcesoRecepcion,
    agendarSeguimiento,
    reprogramarCita,
    citasDoctorEnConsulta,
    siguienteCitaDoctor,
    tomandoSiguienteDoctor,
    tomarSiguientePacienteDoctor,
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
