"use client"

import { useEffect, useMemo, useState } from "react"

import { authService } from "@/services/auth.service"
import { horarioSucursalService } from "@/services/horario-sucursal.service"
import { sucursalService } from "@/services/sucursal.service"
import { normalizeRole } from "@/lib/authorization"
import {
  AsuetoSucursalResponseDto,
  DiaSemanaConfig,
  HorarioSucursalResponseDto,
} from "@/types/horario-sucursal"
import { SucursalResponseDto } from "@/types/sucursal"

const DIAS_SEMANA: Array<{ diaSemana: number; nombre: string }> = [
  { diaSemana: 1, nombre: "Lunes" },
  { diaSemana: 2, nombre: "Martes" },
  { diaSemana: 3, nombre: "Miércoles" },
  { diaSemana: 4, nombre: "Jueves" },
  { diaSemana: 5, nombre: "Viernes" },
  { diaSemana: 6, nombre: "Sábado" },
  { diaSemana: 7, nombre: "Domingo" },
]

function defaultConfig(): DiaSemanaConfig[] {
  return DIAS_SEMANA.map((dia) => ({
    diaSemana: dia.diaSemana,
    nombre: dia.nombre,
    cerrado: dia.diaSemana >= 6,
    horaInicio: "08:00",
    horaFin: "17:00",
  }))
}

function normalizeDiaSemana(dia: number) {
  if (dia === 0) return 7
  return dia
}

function withSeconds(time: string) {
  return time.length === 5 ? `${time}:00` : time
}

function toTimeInput(time?: string | null) {
  if (!time) return "08:00"
  return time.slice(0, 5)
}

function mapConfigFromHorarios(horarios: HorarioSucursalResponseDto[]) {
  return defaultConfig().map((dia) => {
    const horario = horarios.find((h) => normalizeDiaSemana(h.diaSemana) === dia.diaSemana)

    if (!horario) {
      return dia
    }

    return {
      ...dia,
      horarioId: horario.id,
      cerrado: false,
      horaInicio: toTimeInput(horario.horaInicio),
      horaFin: toTimeInput(horario.horaFin),
    }
  })
}

export function useBranchesSchedule() {
  const [clinicId, setClinicId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [horariosPorSucursal, setHorariosPorSucursal] = useState<Record<number, HorarioSucursalResponseDto[]>>({})
  const [asuetosPorSucursal, setAsuetosPorSucursal] = useState<Record<number, AsuetoSucursalResponseDto[]>>({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalInfo, setGlobalInfo] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [nombreSucursal, setNombreSucursal] = useState("")
  const [direccionSucursal, setDireccionSucursal] = useState("")

  const [horarioOpen, setHorarioOpen] = useState(false)
  const [horarioLoading, setHorarioLoading] = useState(false)
  const [horarioSaving, setHorarioSaving] = useState(false)
  const [horarioError, setHorarioError] = useState<string | null>(null)
  const [horarioInfo, setHorarioInfo] = useState<string | null>(null)

  const [selectedSucursal, setSelectedSucursal] = useState<SucursalResponseDto | null>(null)
  const [horariosExistentes, setHorariosExistentes] = useState<HorarioSucursalResponseDto[]>([])
  const [asuetosExistentes, setAsuetosExistentes] = useState<AsuetoSucursalResponseDto[]>([])
  const [configDias, setConfigDias] = useState<DiaSemanaConfig[]>(defaultConfig())

  const [fechaAsueto, setFechaAsueto] = useState("")
  const [motivoAsueto, setMotivoAsueto] = useState("")
  const [asuetoLoading, setAsuetoLoading] = useState(false)

  const canManage = useMemo(() => isAdmin, [isAdmin])

  const loadSucursales = async (idClinica: number) => {
    const data = await sucursalService.obtenerPorClinica(idClinica)
    setSucursales(data)

    const resultados = await Promise.all(
      data.map(async (sucursal) => {
        const [horarios, asuetos] = await Promise.all([
          horarioSucursalService.obtenerPorSucursal(sucursal.id).catch(() => []),
          horarioSucursalService.obtenerAsuetosPorSucursal(sucursal.id).catch(() => []),
        ])

        return { sucursalId: sucursal.id, horarios, asuetos }
      })
    )

    const horariosMap = resultados.reduce<Record<number, HorarioSucursalResponseDto[]>>((acc, item) => {
      acc[item.sucursalId] = item.horarios
      return acc
    }, {})

    const asuetosMap = resultados.reduce<Record<number, AsuetoSucursalResponseDto[]>>((acc, item) => {
      acc[item.sucursalId] = item.asuetos
      return acc
    }, {})

    setHorariosPorSucursal(horariosMap)
    setAsuetosPorSucursal(asuetosMap)
  }

  const refreshSucursalData = async (sucursalId: number) => {
    const [horarios, asuetos] = await Promise.all([
      horarioSucursalService.obtenerPorSucursal(sucursalId),
      horarioSucursalService.obtenerAsuetosPorSucursal(sucursalId),
    ])

    setHorariosPorSucursal((prev) => ({ ...prev, [sucursalId]: horarios }))
    setAsuetosPorSucursal((prev) => ({ ...prev, [sucursalId]: asuetos }))

    setHorariosExistentes(horarios)
    setAsuetosExistentes(asuetos)
    setConfigDias(mapConfigFromHorarios(horarios))
  }

  const getResumenHorario = (sucursalId: number) => {
    const horarios = horariosPorSucursal[sucursalId] ?? []
    if (horarios.length === 0) return "Sin horarios configurados"

    const dias = horarios.map((h) => normalizeDiaSemana(h.diaSemana)).sort((a, b) => a - b)

    const primerDia = DIAS_SEMANA.find((d) => d.diaSemana === dias[0])?.nombre ?? "Día"
    const ultimoDia = DIAS_SEMANA.find((d) => d.diaSemana === dias[dias.length - 1])?.nombre ?? "Día"

    const horarioReferencia = horarios[0]
    const rango = `${toTimeInput(horarioReferencia.horaInicio)} - ${toTimeInput(horarioReferencia.horaFin)}`

    return `${primerDia} a ${ultimoDia} · ${rango}`
  }

  const getResumenAsuetos = (sucursalId: number) => {
    const asuetos = asuetosPorSucursal[sucursalId] ?? []
    if (asuetos.length === 0) return "Sin asuetos registrados"

    return `${asuetos.length} asueto(s) configurado(s)`
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      setGlobalInfo(null)

      try {
        const perfil = await authService.getProfile()
        setClinicId(perfil.idClinica)
        setIsAdmin(normalizeRole(perfil.rol) === "Admin")
        await loadSucursales(perfil.idClinica)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la información")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const handleCreateSucursal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId || !canManage) return

    setCreateLoading(true)
    setError(null)
    setGlobalInfo(null)

    try {
      await sucursalService.crear({
        idClinica: clinicId,
        nombre: nombreSucursal.trim(),
        direccion: direccionSucursal.trim(),
      })

      setNombreSucursal("")
      setDireccionSucursal("")
      setCreateOpen(false)
      await loadSucursales(clinicId)
      setGlobalInfo("Sucursal creada correctamente.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la sucursal")
    } finally {
      setCreateLoading(false)
    }
  }

  const openHorarioConfig = async (sucursal: SucursalResponseDto) => {
    setSelectedSucursal(sucursal)
    setHorarioOpen(true)
    setHorarioLoading(true)
    setHorarioError(null)
    setHorarioInfo(null)
    setGlobalInfo(null)

    try {
      await refreshSucursalData(sucursal.id)
    } catch (err) {
      setHorarioError(err instanceof Error ? err.message : "No se pudieron cargar horarios")
      setConfigDias(defaultConfig())
      setHorariosExistentes([])
      setAsuetosExistentes([])
    } finally {
      setHorarioLoading(false)
    }
  }

  const updateDay = (diaSemana: number, changes: Partial<DiaSemanaConfig>) => {
    setConfigDias((prev) => prev.map((d) => (d.diaSemana === diaSemana ? { ...d, ...changes } : d)))
  }

  const handleGuardarHorarios = async () => {
    if (!selectedSucursal || !canManage) return

    const diaInvalido = configDias.find(
      (dia) => !dia.cerrado && (!dia.horaInicio || !dia.horaFin || dia.horaInicio >= dia.horaFin)
    )

    if (diaInvalido) {
      setHorarioError(`Rango inválido en ${diaInvalido.nombre}. Verifica hora de inicio y fin.`)
      return
    }

    setHorarioSaving(true)
    setHorarioError(null)
    setHorarioInfo(null)
    setGlobalInfo(null)

    try {
      const existentesPorDia = horariosExistentes.reduce<Record<number, HorarioSucursalResponseDto[]>>((acc, horario) => {
        const dia = normalizeDiaSemana(horario.diaSemana)
        if (!acc[dia]) acc[dia] = []
        acc[dia].push(horario)
        return acc
      }, {})

      let creados = 0
      let actualizados = 0
      let eliminados = 0

      for (const dia of configDias) {
        const existentes = existentesPorDia[dia.diaSemana] ?? []

        if (dia.cerrado) {
          for (const item of existentes) {
            await horarioSucursalService.eliminar(item.id)
            eliminados += 1
          }
          continue
        }

        const payload = {
          diaSemana: dia.diaSemana,
          horaInicio: withSeconds(dia.horaInicio),
          horaFin: withSeconds(dia.horaFin),
        }

        if (existentes.length === 0) {
          await horarioSucursalService.crear({
            idSucursal: selectedSucursal.id,
            ...payload,
          })
          creados += 1
          continue
        }

        const [primero, ...resto] = existentes
        const inicioActual = withSeconds(toTimeInput(primero.horaInicio))
        const finActual = withSeconds(toTimeInput(primero.horaFin))
        const mismoHorario =
          normalizeDiaSemana(primero.diaSemana) === payload.diaSemana &&
          inicioActual === payload.horaInicio &&
          finActual === payload.horaFin

        if (!mismoHorario) {
          await horarioSucursalService.actualizar(primero.id, payload)
          actualizados += 1
        }

        for (const extra of resto) {
          await horarioSucursalService.eliminar(extra.id)
          eliminados += 1
        }
      }

      await refreshSucursalData(selectedSucursal.id)
      const resumen = `Configuración guardada. Creados: ${creados}, actualizados: ${actualizados}, eliminados: ${eliminados}.`
      setHorarioInfo(resumen)
      setGlobalInfo(resumen)
      setHorarioOpen(false)
    } catch (err) {
      setHorarioError(err instanceof Error ? err.message : "No se pudieron guardar horarios")
    } finally {
      setHorarioSaving(false)
    }
  }

  const handleCrearAsueto = async () => {
    if (!selectedSucursal || !canManage || !fechaAsueto) return

    setAsuetoLoading(true)
    setHorarioError(null)
    setHorarioInfo(null)
    setGlobalInfo(null)

    try {
      await horarioSucursalService.crearAsueto({
        idSucursal: selectedSucursal.id,
        fecha: fechaAsueto,
        motivo: motivoAsueto.trim() || null,
      })

      setFechaAsueto("")
      setMotivoAsueto("")
      await refreshSucursalData(selectedSucursal.id)
      setHorarioInfo("Asueto agregado correctamente.")
      setGlobalInfo("Asueto agregado correctamente.")
    } catch (err) {
      setHorarioError(err instanceof Error ? err.message : "No se pudo crear el asueto")
    } finally {
      setAsuetoLoading(false)
    }
  }

  const handleEliminarAsueto = async (id: number) => {
    if (!selectedSucursal || !canManage) return

    setAsuetoLoading(true)
    setHorarioError(null)
    setGlobalInfo(null)

    try {
      await horarioSucursalService.eliminarAsueto(id)
      await refreshSucursalData(selectedSucursal.id)
      setHorarioInfo("Asueto eliminado correctamente.")
      setGlobalInfo("Asueto eliminado correctamente.")
    } catch (err) {
      setHorarioError(err instanceof Error ? err.message : "No se pudo eliminar el asueto")
    } finally {
      setAsuetoLoading(false)
    }
  }

  return {
    canManage,
    loading,
    error,
    globalInfo,
    sucursales,
    createOpen,
    setCreateOpen,
    createLoading,
    nombreSucursal,
    setNombreSucursal,
    direccionSucursal,
    setDireccionSucursal,
    handleCreateSucursal,
    horarioOpen,
    setHorarioOpen,
    horarioLoading,
    horarioSaving,
    horarioError,
    horarioInfo,
    selectedSucursal,
    configDias,
    updateDay,
    handleGuardarHorarios,
    openHorarioConfig,
    getResumenHorario,
    getResumenAsuetos,
    asuetosExistentes,
    fechaAsueto,
    setFechaAsueto,
    motivoAsueto,
    setMotivoAsueto,
    asuetoLoading,
    handleCrearAsueto,
    handleEliminarAsueto,
  }
}
