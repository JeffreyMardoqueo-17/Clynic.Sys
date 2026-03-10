"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity,
  BellRing,
  Ban,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ClipboardList,
  HelpCircle,
  History,
  LayoutDashboard,
  Sparkles,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react"

import { useAppointmentPage } from "@/app/(protected)/appointment/hooks/use-appointment-page"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { horarioSucursalService } from "@/services/horario-sucursal.service"
import { servicioService } from "@/services/servicio.service"

import type { CitaResponseDto } from "@/types/cita"
import type { HorarioSucursalResponseDto } from "@/types/horario-sucursal"
import type { CapacidadEspecialidadDiaDto } from "@/types/servicio"

type ReceptionSection = "resumen" | "agenda" | "edicion" | "cancelaciones" | "bitacora"

function estadoLabel(estado: number) {
  if (estado === 1) return "Pendiente"
  if (estado === 2) return "Confirmada"
  if (estado === 3) return "Cancelada"
  if (estado === 4) return "Completada"
  if (estado === 5) return "Presente"
  if (estado === 6) return "En consulta"
  return "N/A"
}

function estadoBadgeVariant(estado: number): "default" | "secondary" | "destructive" | "outline" | "ghost" {
  if (estado === 1) return "outline"
  if (estado === 2) return "secondary"
  if (estado === 3) return "destructive"
  if (estado === 4) return "default"
  if (estado === 5) return "default"
  if (estado === 6) return "ghost"
  return "outline"
}

function toDayRange(fecha: string) {
  return {
    start: new Date(`${fecha}T00:00:00`),
    end: new Date(`${fecha}T23:59:59`),
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getDiaSemanaSistema(date: Date) {
  const jsDay = date.getDay()
  return jsDay === 0 ? 7 : jsDay
}

function minutesUntil(fechaIso: string, nowMs: number) {
  const now = nowMs
  const target = new Date(fechaIso).getTime()
  return Math.floor((target - now) / 60000)
}

function saturacionTag(percent: number) {
  if (percent >= 90) return { label: "Critica", className: "text-destructive" }
  if (percent >= 70) return { label: "Alta", className: "text-amber-600" }
  if (percent >= 45) return { label: "Media", className: "text-primary" }
  return { label: "Baja", className: "text-emerald-600" }
}

export function ReceptionBoard() {
  const vm = useAppointmentPage()
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const [activeSection, setActiveSection] = useState<ReceptionSection>("resumen")
  const [openCreate, setOpenCreate] = useState(false)
  const [fechaAgenda, setFechaAgenda] = useState(todayKey)
  const [fechaBaseVista, setFechaBaseVista] = useState(todayKey)
  const [reprogramacionPorCita, setReprogramacionPorCita] = useState<Record<number, string>>({})
  const [searchLog, setSearchLog] = useState("")
  const [diasVista, setDiasVista] = useState<7 | 14 | 30>(7)
  const [sucursalVista, setSucursalVista] = useState<number | "all">("all")
  const [capacidadRows, setCapacidadRows] = useState<CapacidadEspecialidadDiaDto[]>([])
  const [ventanaCancelacionHoras, setVentanaCancelacionHoras] = useState<2 | 4 | 8 | 12 | 24>(8)
  const [ventanaNotificacionHoras, setVentanaNotificacionHoras] = useState<6 | 12 | 24 | 48>(24)
  const [nowMs, setNowMs] = useState<number>(() => new Date().getTime())
  const [diasLaboralesSucursal, setDiasLaboralesSucursal] = useState<Set<number> | null>(null)
  const sucursalActivaId = vm.role === "Admin"
    ? (sucursalVista === "all" ? 0 : sucursalVista)
    : (vm.idSucursalUsuario || 0)

  const esDiaLaboral = (date: Date) => {
    if (diasLaboralesSucursal === null) return true
    return diasLaboralesSucursal.has(getDiaSemanaSistema(date))
  }

  const moverPorDiasLaborales = (base: Date, cantidad: number) => {
    if (cantidad === 0) return new Date(base)

    const direction = cantidad > 0 ? 1 : -1
    let remaining = Math.abs(cantidad)
    let current = new Date(base)
    let guard = 0

    while (remaining > 0 && guard < 365) {
      current = addDays(current, direction)
      guard += 1
      if (esDiaLaboral(current)) {
        remaining -= 1
      }
    }

    return current
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(new Date().getTime())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!sucursalActivaId) {
      setDiasLaboralesSucursal(null)
      return
    }

    let active = true

    horarioSucursalService
      .obtenerPorSucursal(sucursalActivaId)
      .then((rows: HorarioSucursalResponseDto[]) => {
        if (!active) return
        const dias = new Set(rows.map((item) => item.diaSemana).filter((dia) => dia >= 1 && dia <= 7))
        setDiasLaboralesSucursal(dias)
      })
      .catch(() => {
        if (active) {
          setDiasLaboralesSucursal(null)
        }
      })

    return () => {
      active = false
    }
  }, [sucursalActivaId])

  useEffect(() => {
    if (diasLaboralesSucursal === null || diasLaboralesSucursal.size === 0) return

    const selected = new Date(`${fechaAgenda}T00:00:00`)
    if (esDiaLaboral(selected)) return

    for (let i = 0; i < 14; i += 1) {
      const next = addDays(selected, i + 1)
      if (esDiaLaboral(next)) {
        const nextKey = toDateKey(next)
        setFechaAgenda(nextKey)
        setFechaBaseVista(nextKey)
        return
      }
    }
  }, [fechaAgenda, diasLaboralesSucursal])

  useEffect(() => {
    if (!vm.idClinica || !fechaBaseVista) return

    const inicio = new Date(`${fechaBaseVista}T00:00:00`)
    const fin = moverPorDiasLaborales(inicio, Math.max(0, diasVista - 1))
    const fechaDesde = toDateKey(inicio)
    const fechaHasta = toDateKey(fin)

    let active = true

    servicioService
      .obtenerCapacidadPorEspecialidad(vm.idClinica, {
        fechaDesde,
        fechaHasta,
        idSucursal: sucursalActivaId || undefined,
        horasLaborablesDia: 8,
        minutosAlmuerzoDia: 60,
      })
      .then((data) => {
        if (active) {
          setCapacidadRows(data)
        }
      })
      .catch(() => {
        if (active) {
          setCapacidadRows([])
        }
      })

    return () => {
      active = false
    }
  }, [vm.idClinica, fechaBaseVista, diasVista, sucursalActivaId, diasLaboralesSucursal])

  const agendaDia = useMemo(() => {
    const { start, end } = toDayRange(fechaAgenda)

    return vm.citasTodas
      .filter((cita) => {
        const inicio = new Date(cita.fechaHoraInicioPlan)
        if (inicio < start || inicio > end) return false
        if (!sucursalActivaId) return true
        return cita.idSucursal === sucursalActivaId
      })
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())
  }, [vm.citasTodas, fechaAgenda, sucursalActivaId])

  const agendaDiaActiva = useMemo(
    () => agendaDia.filter((cita) => cita.estado !== 3),
    [agendaDia]
  )

  const horasAgenda = useMemo(() => {
    const bloques: Array<{ hora: string; citas: CitaResponseDto[] }> = []
    for (let hora = 6; hora <= 20; hora += 1) {
      const hh = String(hora).padStart(2, "0")
      const citasHora = agendaDia.filter((cita) => new Date(cita.fechaHoraInicioPlan).getHours() === hora)
      bloques.push({ hora: `${hh}:00`, citas: citasHora })
    }
    return bloques
  }, [agendaDia])

  const capacidadDiaSeleccionado = useMemo(() => {
    const key = fechaAgenda
    const rows = capacidadRows.filter((item) => (item.fecha ?? "").slice(0, 10) === key)
    if (rows.length === 0) {
      const totalFallback = Math.max(1, vm.especialidadesDisponiblesCrear.reduce((acc, item) => acc + Math.max(0, item.citasMaximasPorDia), 0))
      const ocupadasFallback = Math.min(totalFallback, agendaDiaActiva.length)
      return {
        total: totalFallback,
        ocupadas: ocupadasFallback,
        disponibles: Math.max(0, totalFallback - ocupadasFallback),
      }
    }

    const total = Math.max(1, rows.reduce((acc, item) => acc + Math.max(0, item.citasPosiblesDia), 0))
    const ocupadas = Math.min(total, rows.reduce((acc, item) => acc + Math.max(0, item.totalCitasAgendadas), 0))
    return {
      total,
      ocupadas,
      disponibles: Math.max(0, total - ocupadas),
    }
  }, [capacidadRows, fechaAgenda, vm.especialidadesDisponiblesCrear, agendaDiaActiva.length])

  const totalEspaciosDia = capacidadDiaSeleccionado.total
  const totalOcupadoDia = capacidadDiaSeleccionado.ocupadas
  const totalDisponibleDia = capacidadDiaSeleccionado.disponibles
  const ocupacionPctDia = Math.round((totalOcupadoDia / totalEspaciosDia) * 100)

  const vistaDias = useMemo(() => {
    const inicio = new Date(`${fechaBaseVista}T00:00:00`)
    const dias = [] as Array<{
      key: string
      fechaLabel: string
      diaCorto: string
      total: number
      ocupados: number
      disponibles: number
      cobertura: number
      saturacion: ReturnType<typeof saturacionTag>
    }>

    let offset = 0
    let guard = 0

    while (dias.length < diasVista && guard < 120) {
      const current = addDays(inicio, offset)
      offset += 1
      guard += 1

      if (!esDiaLaboral(current)) {
        continue
      }

      const key = toDateKey(current)
      const rows = capacidadRows.filter((item) => (item.fecha ?? "").slice(0, 10) === key)
      const total = Math.max(1, rows.reduce((acc, item) => acc + Math.max(0, item.citasPosiblesDia), 0))
      const ocupados = Math.min(total, rows.reduce((acc, item) => acc + Math.max(0, item.totalCitasAgendadas), 0))
      const disponibles = Math.max(0, total - ocupados)
      const cobertura = Math.round((ocupados / total) * 100)

      dias.push({
        key,
        fechaLabel: current.toLocaleDateString([], { day: "2-digit", month: "short" }),
        diaCorto: current.toLocaleDateString([], { weekday: "short" }),
        total,
        ocupados,
        disponibles,
        cobertura,
        saturacion: saturacionTag(cobertura),
      })
    }

    return dias
  }, [fechaBaseVista, diasVista, capacidadRows, diasLaboralesSucursal])

  const resumenEspecialidades = useMemo(() => {
    const grouped = new Map<number, {
      idEspecialidad: number
      nombreEspecialidad: string
      agendadas: number
      posibles: number
      disponibles: number
      saturacionPromedio: number
      diasConDatos: number
    }>()

    for (const row of capacidadRows) {
      const curr = grouped.get(row.idEspecialidad)
      if (!curr) {
        grouped.set(row.idEspecialidad, {
          idEspecialidad: row.idEspecialidad,
          nombreEspecialidad: row.nombreEspecialidad,
          agendadas: row.totalCitasAgendadas,
          posibles: row.citasPosiblesDia,
          disponibles: row.citasDisponiblesDia,
          saturacionPromedio: row.saturacionPct,
          diasConDatos: 1,
        })
      } else {
        curr.agendadas += row.totalCitasAgendadas
        curr.posibles += row.citasPosiblesDia
        curr.disponibles += row.citasDisponiblesDia
        curr.saturacionPromedio += row.saturacionPct
        curr.diasConDatos += 1
      }
    }

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        saturacionPromedio: item.diasConDatos > 0
          ? Math.round((item.saturacionPromedio / item.diasConDatos) * 100) / 100
          : 0,
      }))
      .sort((a, b) => b.agendadas - a.agendadas)
  }, [capacidadRows])

  const irRangoAnterior = () => {
    const base = new Date(`${fechaBaseVista}T00:00:00`)
    setFechaBaseVista(toDateKey(moverPorDiasLaborales(base, -diasVista)))
  }

  const irRangoSiguiente = () => {
    const base = new Date(`${fechaBaseVista}T00:00:00`)
    setFechaBaseVista(toDateKey(moverPorDiasLaborales(base, diasVista)))
  }

  const resumenRango = useMemo(() => {
    const totalCapacidad = vistaDias.reduce((acc, day) => acc + day.total, 0)
    const totalOcupado = vistaDias.reduce((acc, day) => acc + day.ocupados, 0)
    const totalDisponible = Math.max(0, totalCapacidad - totalOcupado)
    const cobertura = totalCapacidad > 0 ? Math.round((totalOcupado / totalCapacidad) * 100) : 0
    return { totalCapacidad, totalOcupado, totalDisponible, cobertura }
  }, [vistaDias])

  const promediosRango = useMemo(() => {
    const dias = Math.max(1, vistaDias.length)
    const capacidadDiaAprox = Math.round((resumenRango.totalCapacidad / dias) * 10) / 10
    const ocupadasDiaAprox = Math.round((resumenRango.totalOcupado / dias) * 10) / 10
    const libresDiaAprox = Math.round((resumenRango.totalDisponible / dias) * 10) / 10
    return { capacidadDiaAprox, ocupadasDiaAprox, libresDiaAprox }
  }, [vistaDias.length, resumenRango])

  const resumenSucursalesAdmin = useMemo(() => {
    if (vm.role !== "Admin") return [] as Array<{ id: number; nombre: string; ocupadas: number; cobertura: number }>

    const { start, end } = toDayRange(fechaAgenda)
    const capacidadPorSucursal = Math.max(1, totalEspaciosDia)

    return vm.sucursales.map((sucursal) => {
      const ocupadasRaw = vm.citasTodas.filter((cita) => {
        const inicioCita = new Date(cita.fechaHoraInicioPlan)
        return cita.idSucursal === sucursal.id && cita.estado !== 3 && inicioCita >= start && inicioCita <= end
      }).length
      const ocupadas = Math.min(capacidadPorSucursal, ocupadasRaw)
      const cobertura = Math.round((ocupadas / capacidadPorSucursal) * 100)

      return {
        id: sucursal.id,
        nombre: sucursal.nombre,
        ocupadas,
        cobertura,
      }
    })
  }, [vm.role, vm.sucursales, vm.citasTodas, fechaAgenda, totalEspaciosDia])

  const citasProximas = useMemo(() => {
    return vm.citasTodas
      .filter((cita) => cita.estado !== 3 && cita.estado !== 4)
      .filter((cita) => !sucursalActivaId || cita.idSucursal === sucursalActivaId)
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())
      .slice(0, 40)
  }, [vm.citasTodas, sucursalActivaId])

  const citasCancelables = useMemo(() => {
    return vm.citasTodas
      .filter((cita) => cita.estado !== 3 && cita.estado !== 4)
      .filter((cita) => !sucursalActivaId || cita.idSucursal === sucursalActivaId)
      .map((cita) => {
        const minutos = minutesUntil(cita.fechaHoraInicioPlan, nowMs)
        const dentroVentana = minutos >= 0 && minutos <= ventanaCancelacionHoras * 60
        return { cita, minutos, dentroVentana }
      })
      .sort((a, b) => a.minutos - b.minutos)
  }, [vm.citasTodas, sucursalActivaId, ventanaCancelacionHoras, nowMs])

  const actividadCancelacionesRecientes = useMemo(() => {
    const limite = new Date(nowMs - ventanaNotificacionHoras * 60 * 60 * 1000)
    return vm.actividadCitas
      .filter((item) => !sucursalActivaId || item.idSucursal === sucursalActivaId)
      .filter((item) => /cancel/i.test(item.accion) || /cancel/i.test(item.detalle))
      .filter((item) => new Date(item.fechaCreacion) >= limite)
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
  }, [vm.actividadCitas, sucursalActivaId, ventanaNotificacionHoras, nowMs])

  const actividadFiltrada = useMemo(() => {
    const term = searchLog.trim().toLowerCase()
    const rows = vm.actividadCitas.filter((item) => !sucursalActivaId || item.idSucursal === sucursalActivaId)
    if (!term) return rows

    return rows.filter((item) => {
      const raw = `${item.accion} ${item.detalle} ${item.rolUsuario} ${item.idCita}`.toLowerCase()
      return raw.includes(term)
    })
  }, [vm.actividadCitas, searchLog, sucursalActivaId])

  if (vm.loading) {
    return <p className="text-sm text-muted-foreground">Cargando tablero de recepcion...</p>
  }

  if (!(vm.role === "Admin" || vm.role === "Recepcionista")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Modulo de recepcion</CardTitle>
          <CardDescription>
            Esta vista esta optimizada para recepcion y administracion operativa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/appointment">Ir a agenda general</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="reception-board-shell space-y-6">
        <header className="rounded-2xl border bg-linear-to-r from-primary/15 via-background to-primary/5 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Operacion diaria</p>
              <h1 className="mt-1 text-3xl font-bold md:text-4xl">Tablero unico de recepcion</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Vista clara para operar rapido: resumen visual, agenda, edicion y bitacora en una sola pagina.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              {vm.canFilterBySucursal && (
                <select
                  className="border-input bg-background min-w-48 rounded-md border px-3 py-2 text-sm"
                  value={sucursalVista}
                  onChange={(e) =>
                    setSucursalVista(e.target.value === "all" ? "all" : Number(e.target.value))
                  }
                >
                  <option value="all">Todas las sucursales</option>
                  {vm.sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              )}

              <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button type="button" className="shadow-sm">
                    <CalendarPlus className="size-4" />
                    Nueva cita
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Agendar cita interna</DialogTitle>
                    <DialogDescription>
                      Registro integral para operacion de recepcion.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Paciente *</label>
                        <select
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                          value={vm.idPacienteCrear || ""}
                          onChange={(e) => vm.setIdPacienteCrear(Number(e.target.value))}
                        >
                          <option value="">Selecciona</option>
                          {vm.pacientes.map((paciente) => (
                            <option key={paciente.id} value={paciente.id}>
                              {paciente.nombreCompleto}
                            </option>
                          ))}
                        </select>

                        <div className="rounded-md border bg-muted/30 p-3">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Registro rapido de paciente</p>
                          <div className="grid gap-2 md:grid-cols-2">
                            <input
                              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                              placeholder="Nombres *"
                              value={vm.formNuevoPaciente.nombres}
                              onChange={(e) => vm.setFormNuevoPaciente((prev) => ({ ...prev, nombres: e.target.value }))}
                            />
                            <input
                              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                              placeholder="Apellidos *"
                              value={vm.formNuevoPaciente.apellidos}
                              onChange={(e) => vm.setFormNuevoPaciente((prev) => ({ ...prev, apellidos: e.target.value }))}
                            />
                            <input
                              type="email"
                              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                              placeholder="Correo *"
                              value={vm.formNuevoPaciente.correo}
                              onChange={(e) => vm.setFormNuevoPaciente((prev) => ({ ...prev, correo: e.target.value }))}
                            />
                            <input
                              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                              placeholder="Telefono"
                              value={vm.formNuevoPaciente.telefono ?? ""}
                              onChange={(e) => vm.setFormNuevoPaciente((prev) => ({ ...prev, telefono: e.target.value }))}
                            />
                            <input
                              type="date"
                              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                              value={vm.formNuevoPaciente.fechaNacimiento ?? ""}
                              onChange={(e) => vm.setFormNuevoPaciente((prev) => ({ ...prev, fechaNacimiento: e.target.value }))}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={vm.registrarPacienteRapido}
                              disabled={vm.crearPacienteLoading}
                            >
                              {vm.crearPacienteLoading ? "Registrando..." : "Registrar paciente"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sucursal *</label>
                        <select
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                          value={vm.idSucursalCrear || ""}
                          onChange={(e) => vm.setIdSucursalCrear(Number(e.target.value))}
                          disabled={!vm.canFilterBySucursal}
                        >
                          <option value="">Selecciona</option>
                          {vm.sucursales.map((sucursal) => (
                            <option key={sucursal.id} value={sucursal.id}>
                              {sucursal.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Doctor</label>
                        <select
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                          value={vm.idDoctorCrear}
                          onChange={(e) => vm.setIdDoctorCrear(e.target.value === "none" ? "none" : Number(e.target.value))}
                        >
                          <option value="none">Sin asignar</option>
                          {vm.doctoresDisponiblesCrear.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.nombreCompleto}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Especialidad *</label>
                        <select
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                          value={vm.idEspecialidadCrear || ""}
                          onChange={(e) => vm.setIdEspecialidadCrear(Number(e.target.value))}
                        >
                          <option value="">Selecciona</option>
                          {vm.especialidadesDisponiblesCrear.map((especialidad) => (
                            <option key={`${especialidad.idSucursal}-${especialidad.idEspecialidad}`} value={especialidad.idEspecialidad}>
                              {especialidad.nombreEspecialidad}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha y hora *</label>
                        <input
                          type="datetime-local"
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                          value={vm.fechaHoraCrear}
                          onChange={(e) => vm.setFechaHoraCrear(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estado inicial</label>
                        <select
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                          value={vm.estadoInicialCrear}
                          onChange={(e) => vm.setEstadoInicialCrear(Number(e.target.value) as 1 | 2 | 3 | 4)}
                        >
                          <option value={1}>Pendiente</option>
                          <option value={2}>Confirmada</option>
                          <option value={3}>Cancelada</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Servicios *</label>
                      <div className="grid gap-2 md:grid-cols-2">
                        {vm.servicios.map((servicio) => (
                          <label
                            key={servicio.id}
                            className="border-border flex items-center justify-between rounded-md border p-3 text-sm"
                          >
                            <span>{servicio.nombreServicio}</span>
                            <input
                              type="checkbox"
                              checked={vm.idsServiciosCrear.includes(servicio.id)}
                              onChange={() => vm.toggleServicioCrear(servicio.id)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {vm.disponibilidadCrear && (
                      <p className="rounded-md bg-primary/5 p-2 text-xs text-primary">
                        Cupo diario: {vm.disponibilidadCrear.citasMaximasPorDiaEspecialidad} · Agendadas: {vm.disponibilidadCrear.citasOcupadasDiaEspecialidad} · Disponibles: {vm.cuposDisponiblesCrear}
                      </p>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notas</label>
                      <textarea
                        className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                        value={vm.notasCrear}
                        onChange={(e) => vm.setNotasCrear(e.target.value)}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={vm.crearCitaInterna}
                      disabled={vm.createLoading || vm.disponibilidadCrearLoading || (vm.disponibilidadCrear !== null && vm.cuposDisponiblesCrear <= 0)}
                    >
                      <CalendarPlus className="size-4" />
                      {vm.createLoading ? "Agendando..." : "Agendar cita"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs uppercase tracking-wider">Sesiones de trabajo</CardDescription>
            <CardTitle className="text-base md:text-lg">Sesiones</CardTitle>
          </CardHeader>
          <CardContent>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {activeSection === "resumen" ? (
                    <BreadcrumbPage>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary">
                        <LayoutDashboard className="size-4" /> Resumen
                      </span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button type="button" className="inline-flex items-center gap-1.5" onClick={() => setActiveSection("resumen")}>
                        <LayoutDashboard className="size-4" /> Resumen
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {activeSection === "agenda" ? (
                    <BreadcrumbPage>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary">
                        <CalendarCheck2 className="size-4" /> Agenda
                      </span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button type="button" className="inline-flex items-center gap-1.5" onClick={() => setActiveSection("agenda")}>
                        <CalendarCheck2 className="size-4" /> Agenda
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {activeSection === "edicion" ? (
                    <BreadcrumbPage>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary">
                        <ClipboardList className="size-4" /> Edicion
                      </span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button type="button" className="inline-flex items-center gap-1.5" onClick={() => setActiveSection("edicion")}>
                        <ClipboardList className="size-4" /> Edicion
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {activeSection === "cancelaciones" ? (
                    <BreadcrumbPage>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary">
                        <Ban className="size-4" /> Cancelaciones
                      </span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button type="button" className="inline-flex items-center gap-1.5" onClick={() => setActiveSection("cancelaciones")}>
                        <Ban className="size-4" /> Cancelaciones
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {activeSection === "bitacora" ? (
                    <BreadcrumbPage>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary">
                        <History className="size-4" /> Bitacora
                      </span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button type="button" className="inline-flex items-center gap-1.5" onClick={() => setActiveSection("bitacora")}>
                        <History className="size-4" /> Bitacora
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>

        {activeSection === "resumen" && (
          <>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <Card className="xl:col-span-2 border-primary/20 bg-linear-to-r from-primary/10 via-background to-background">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Sparkles className="size-4 text-primary" /> Capacidad del dia
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                        <HelpCircle className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>
                      Basado en cupos de especialidades cargados desde backend para la sucursal activa.
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Espacios</p>
                    <p className="text-2xl font-semibold">{totalEspaciosDia}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Aprox libres hoy: {totalDisponibleDia}</p>
                  </div>
                  <div className="rounded-xl border border-amber-300/40 bg-amber-50/40 p-3">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Activity className="size-3.5" /> Ocupados</p>
                    <p className="text-2xl font-semibold">{totalOcupadoDia}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Aprox por dia: {promediosRango.ocupadasDiaAprox}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-300/40 bg-emerald-50/40 p-3">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarCheck2 className="size-3.5" /> Libres</p>
                    <p className="text-2xl font-semibold">{totalDisponibleDia}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Promedio libre: {promediosRango.libresDiaAprox}</p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-background p-3">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="size-3.5" /> Cobertura</p>
                    <p className="text-2xl font-semibold">{ocupacionPctDia}%</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Capacidad aprox/dia: {promediosRango.capacidadDiaAprox}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Ocupacion operativa del dia</span>
                    <span>{totalOcupadoDia}/{totalEspaciosDia}</span>
                  </div>
                  <Progress value={ocupacionPctDia} />
                </div>
              </CardHeader>
            </Card>

              <Card className="border-primary/20">
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wider">Fecha de trabajo</CardDescription>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" /> Agenda del dia</CardTitle>
                <input
                  type="date"
                  className="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
                  value={fechaAgenda}
                  onChange={(e) => {
                    const next = e.target.value
                    setFechaAgenda(next)
                    setFechaBaseVista(next)
                  }}
                />
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="flex items-center justify-between"><span className="text-muted-foreground">Citas del dia</span><span className="font-semibold">{agendaDia.length}</span></p>
                <p className="flex items-center justify-between"><span className="text-muted-foreground">En consulta</span><span className="font-semibold">{vm.citas.filter((item) => item.estado === 6).length}</span></p>
                <p className="flex items-center justify-between"><span className="text-muted-foreground">Eventos en bitacora</span><span className="font-semibold">{actividadFiltrada.length}</span></p>
              </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Proyeccion de saturacion por dias</CardTitle>
                    <CardDescription>
                      Elige un dia y revisa disponibilidad.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" size="icon" variant="outline" onClick={irRangoAnterior} title="Rango anterior">
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button type="button" size="sm" variant={diasVista === 7 ? "default" : "outline"} onClick={() => setDiasVista(7)}>7 dias</Button>
                    <Button type="button" size="sm" variant={diasVista === 14 ? "default" : "outline"} onClick={() => setDiasVista(14)}>14 dias</Button>
                    <Button type="button" size="sm" variant={diasVista === 30 ? "default" : "outline"} onClick={() => setDiasVista(30)}>30 dias</Button>
                    <Button type="button" size="icon" variant="outline" onClick={irRangoSiguiente} title="Rango siguiente">
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Sparkles className="size-3.5" /> Capacidad total aprox</p>
                    <p className="text-xl font-semibold">{resumenRango.totalCapacidad}</p>
                  </div>
                  <div className="rounded-lg border border-chart-1/35 bg-chart-1/10 p-3">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><Activity className="size-3.5" /> Ocupadas aprox</p>
                    <p className="text-xl font-semibold">{resumenRango.totalOcupado}</p>
                  </div>
                  <div className="rounded-lg border border-chart-2/35 bg-chart-2/10 p-3">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarCheck2 className="size-3.5" /> Libres aprox</p>
                    <p className="text-xl font-semibold">{resumenRango.totalDisponible}</p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Cobertura promedio</p>
                    <p className="text-xl font-semibold">{resumenRango.cobertura}%</p>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/25 bg-card p-3 text-xs text-muted-foreground">
                  Aprox por dia en este rango: capacidad {promediosRango.capacidadDiaAprox}, ocupadas {promediosRango.ocupadasDiaAprox}, libres {promediosRango.libresDiaAprox}.
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                  <div className="xl:col-span-8">
                    <div className="overflow-hidden rounded-xl border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr className="text-left">
                            <th className="px-3 py-2 font-medium">Dia</th>
                            <th className="px-3 py-2 font-medium">Citas</th>
                            <th className="px-3 py-2 font-medium">Capacidad</th>
                            <th className="px-3 py-2 font-medium">Disponibles</th>
                            <th className="px-3 py-2 font-medium">Estado</th>
                            <th className="px-3 py-2 font-medium text-right">Accion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vistaDias.map((day) => (
                            <tr key={day.key} className={`border-t ${fechaAgenda === day.key ? "bg-primary/5" : "hover:bg-muted/20"}`}>
                              <td className="px-3 py-2">
                                <p className="font-medium">{day.fechaLabel}</p>
                                <p className="text-xs uppercase text-muted-foreground">{day.diaCorto}</p>
                              </td>
                              <td className="px-3 py-2">{day.ocupados}</td>
                              <td className="px-3 py-2">{day.total}</td>
                              <td className="px-3 py-2">{day.disponibles}</td>
                              <td className="px-3 py-2">
                                <span className={`text-xs font-medium ${day.saturacion.className}`}>{day.saturacion.label}</span>
                                <div className="mt-1 max-w-24">
                                  <Progress value={day.cobertura} className="h-1.5" />
                                </div>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <Button type="button" size="sm" variant={fechaAgenda === day.key ? "default" : "outline"} onClick={() => setFechaAgenda(day.key)}>
                                  Ver dia
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="xl:col-span-4">
                    <div className="rounded-xl border border-primary/25 bg-card p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <CalendarDays className="size-4 text-primary" />
                        <p className="font-medium">Dia seleccionado</p>
                      </div>
                      <p className="text-lg font-semibold">{new Date(`${fechaAgenda}T00:00:00`).toLocaleDateString([], { weekday: "long", day: "2-digit", month: "long" })}</p>
                      <div className="mt-3 space-y-2 text-sm">
                        <p className="flex items-center justify-between"><span className="text-muted-foreground">Citas agendadas</span><span className="font-semibold">{totalOcupadoDia}</span></p>
                        <p className="flex items-center justify-between"><span className="text-muted-foreground">Capacidad total</span><span className="font-semibold">{totalEspaciosDia}</span></p>
                        <p className="flex items-center justify-between"><span className="text-muted-foreground">Cupos libres</span><span className="font-semibold">{totalDisponibleDia}</span></p>
                        <p className="flex items-center justify-between"><span className="text-muted-foreground">Saturacion</span><span className="font-semibold">{ocupacionPctDia}%</span></p>
                      </div>
                      <div className="mt-3">
                        <Progress value={ocupacionPctDia} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>General y por especialidad</CardTitle>
                <CardDescription>
                  Ranking de especialidades con mayor demanda y capacidad restante en el rango seleccionado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resumenEspecialidades.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin datos de capacidad por especialidad para este rango.</p>
                ) : (
                  <div className="space-y-3">
                    {resumenEspecialidades.map((esp) => {
                      const pct = esp.posibles > 0 ? Math.min(100, Math.round((esp.agendadas / esp.posibles) * 100)) : 0
                      return (
                        <div key={esp.idEspecialidad} className="rounded-xl border border-primary/20 bg-card p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium">{esp.nombreEspecialidad}</p>
                            <span className="text-xs text-muted-foreground">Saturacion prom: {esp.saturacionPromedio}%</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>Agendadas: <strong className="text-foreground">{esp.agendadas}</strong></span>
                            <span>Capacidad: <strong className="text-foreground">{esp.posibles}</strong></span>
                            <span>Disponibles: <strong className="text-foreground">{esp.disponibles}</strong></span>
                          </div>
                          <div className="mt-2">
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {vm.role === "Admin" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Building2 className="size-5" /> Administracion por sucursal</CardTitle>
                  <CardDescription>Carga del dia seleccionado para coordinacion administrativa.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {resumenSucursalesAdmin.map((item) => (
                    <div key={item.id} className="rounded-xl border border-primary/20 bg-card p-3">
                      <p className="font-medium">{item.nombre}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.ocupadas} citas activas</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={item.cobertura} className="h-1.5" />
                        <span className="text-xs font-semibold">{item.cobertura}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/25 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><BellRing className="size-4 text-primary" /> Alertas de cancelacion</CardTitle>
                <CardDescription>
                  Cancelaciones detectadas en las ultimas {ventanaNotificacionHoras} horas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Label htmlFor="ventana-notificacion" className="text-xs text-muted-foreground">Ventana de alerta</Label>
                  <select
                    id="ventana-notificacion"
                    className="border-input bg-background rounded-md border px-2 py-1 text-xs"
                    value={ventanaNotificacionHoras}
                    onChange={(e) => setVentanaNotificacionHoras(Number(e.target.value) as 6 | 12 | 24 | 48)}
                  >
                    <option value={6}>6h</option>
                    <option value={12}>12h</option>
                    <option value={24}>24h</option>
                    <option value={48}>48h</option>
                  </select>
                  <Badge variant="outline">{actividadCancelacionesRecientes.length} avisos</Badge>
                </div>

                {actividadCancelacionesRecientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin cancelaciones recientes en el rango elegido.</p>
                ) : (
                  <div className="space-y-2">
                    {actividadCancelacionesRecientes.slice(0, 6).map((item) => (
                      <div key={item.id} className="rounded-lg border border-primary/20 bg-background p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">Cita #{item.idCita} cancelada</p>
                          <p className="text-xs text-muted-foreground">{new Date(item.fechaCreacion).toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.accion} · {item.rolUsuario}</p>
                        <p className="mt-1 text-sm">{item.detalle || "Sin detalle"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeSection === "agenda" && (
          <Card>
            <CardHeader>
              <CardTitle>Agenda por bloques horarios</CardTitle>
              <CardDescription>
                Hover sobre cada accion para ver su objetivo y evitar errores operativos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {horasAgenda.map((bloque) => (
                <div key={bloque.hora} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[84px_1fr]">
                  <p className="text-sm font-semibold text-muted-foreground">{bloque.hora}</p>
                  {bloque.citas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin citas</p>
                  ) : (
                    <div className="space-y-2">
                      {bloque.citas.map((cita) => (
                        <div key={cita.id} className="rounded-lg border bg-background p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium">#{cita.id} · {cita.nombrePaciente}</p>
                            <Badge variant={estadoBadgeVariant(cita.estado)}>{estadoLabel(cita.estado)}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(cita.fechaHoraInicioPlan).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {" - "}
                            {new Date(cita.fechaHoraFinPlan).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            {" · "}
                            {vm.sucursales.find((s) => s.id === cita.idSucursal)?.nombre ?? `Sucursal ${cita.idSucursal}`}
                          </p>

                          {cita.estado !== 3 && cita.estado !== 4 && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <input
                                type="datetime-local"
                                className="border-input bg-background rounded-md border px-2 py-1 text-xs"
                                value={reprogramacionPorCita[cita.id] ?? ""}
                                onChange={(e) => setReprogramacionPorCita((prev) => ({ ...prev, [cita.id]: e.target.value }))}
                              />

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => vm.reprogramarCita(cita.id, reprogramacionPorCita[cita.id] ?? "", "Reprogramada desde tablero de recepcion")}
                                    disabled={vm.estadoLoadingId === cita.id}
                                  >
                                    Reprogramar
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={8}>Mueve la cita y notifica cambio al paciente.</TooltipContent>
                              </Tooltip>

                              {(cita.estado === 1 || cita.estado === 2) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => vm.marcarPresente(cita.id)}
                                      disabled={vm.estadoLoadingId === cita.id}
                                    >
                                      <UserRoundCheck className="size-4" /> Presente
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={8}>Confirma llegada fisica del paciente a recepcion.</TooltipContent>
                                </Tooltip>
                              )}

                              {cita.estado === 5 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => vm.pasarAConsulta(cita.id)}
                                      disabled={vm.estadoLoadingId === cita.id || !cita.idDoctor}
                                    >
                                      <Stethoscope className="size-4" /> Pasar a consulta
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={8}>Entrega el caso al doctor asignado.</TooltipContent>
                                </Tooltip>
                              )}

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      const minutos = minutesUntil(cita.fechaHoraInicioPlan, nowMs)
                                      const dentroVentana = minutos >= 0 && minutos <= ventanaCancelacionHoras * 60
                                      if (!dentroVentana) {
                                        return
                                      }
                                      vm.cambiarEstado(
                                        cita.id,
                                        3,
                                        `Cancelada desde tablero de recepcion (ventana ${ventanaCancelacionHoras}h)`
                                      )
                                    }}
                                    disabled={vm.estadoLoadingId === cita.id || !(minutesUntil(cita.fechaHoraInicioPlan, nowMs) >= 0 && minutesUntil(cita.fechaHoraInicioPlan, nowMs) <= ventanaCancelacionHoras * 60)}
                                  >
                                    Cancelar
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={8}>Solo permite cancelar si la cita entra en la ventana de {ventanaCancelacionHoras}h.</TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "edicion" && (
          <Card>
            <CardHeader>
              <CardTitle>Edicion rapida</CardTitle>
              <CardDescription>Actualiza horarios y estados sin salir de una tabla compacta.</CardDescription>
            </CardHeader>
            <CardContent>
              {citasProximas.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay citas pendientes para editar.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-2 w-20">Cita</th>
                        <th className="p-2">Paciente</th>
                        <th className="p-2">Horario</th>
                        <th className="p-2 w-28">Estado</th>
                        <th className="p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasProximas.map((cita) => (
                        <tr key={cita.id} className="border-b align-top">
                          <td className="p-2">#{cita.id}</td>
                          <td className="p-2">{cita.nombrePaciente}</td>
                          <td className="p-2">{new Date(cita.fechaHoraInicioPlan).toLocaleString()}</td>
                          <td className="p-2">
                            <Badge variant={estadoBadgeVariant(cita.estado)}>{estadoLabel(cita.estado)}</Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="datetime-local"
                                className="border-input bg-background rounded-md border px-2 py-1 text-xs"
                                value={reprogramacionPorCita[cita.id] ?? ""}
                                onChange={(e) => setReprogramacionPorCita((prev) => ({ ...prev, [cita.id]: e.target.value }))}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => vm.reprogramarCita(cita.id, reprogramacionPorCita[cita.id] ?? "", "Reprogramacion rapida desde recepcion")}
                                disabled={vm.estadoLoadingId === cita.id}
                              >
                                Guardar hora
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const minutos = minutesUntil(cita.fechaHoraInicioPlan, nowMs)
                                  const dentroVentana = minutos >= 0 && minutos <= ventanaCancelacionHoras * 60
                                  if (!dentroVentana) {
                                    return
                                  }
                                  vm.cambiarEstado(
                                    cita.id,
                                    3,
                                    `Cancelada desde edicion rapida (ventana ${ventanaCancelacionHoras}h)`
                                  )
                                }}
                                disabled={vm.estadoLoadingId === cita.id || !(minutesUntil(cita.fechaHoraInicioPlan, nowMs) >= 0 && minutesUntil(cita.fechaHoraInicioPlan, nowMs) <= ventanaCancelacionHoras * 60)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === "cancelaciones" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Ban className="size-5 text-destructive" /> Portal de cancelaciones</CardTitle>
              <CardDescription>
                Define el rango permitido y cancela citas de forma controlada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <Label htmlFor="ventana-cancelacion" className="text-xs text-muted-foreground">Ventana para cancelar</Label>
                <select
                  id="ventana-cancelacion"
                  className="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
                  value={ventanaCancelacionHoras}
                  onChange={(e) => setVentanaCancelacionHoras(Number(e.target.value) as 2 | 4 | 8 | 12 | 24)}
                >
                  <option value={2}>2 horas</option>
                  <option value={4}>4 horas</option>
                  <option value={8}>8 horas</option>
                  <option value={12}>12 horas</option>
                  <option value={24}>24 horas</option>
                </select>
                <Badge variant="outline">{citasCancelables.filter((row) => row.dentroVentana).length} cancelables ahora</Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> Regla: solo si faltan menor o igual a {ventanaCancelacionHoras}h.</span>
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="px-3 py-2">Cita</th>
                      <th className="px-3 py-2">Paciente</th>
                      <th className="px-3 py-2">Inicio</th>
                      <th className="px-3 py-2">Faltan</th>
                      <th className="px-3 py-2">Estado regla</th>
                      <th className="px-3 py-2 text-right">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasCancelables.slice(0, 60).map(({ cita, minutos, dentroVentana }) => {
                      const horas = (minutos / 60).toFixed(1)
                      return (
                        <tr key={cita.id} className="border-t">
                          <td className="px-3 py-2 font-medium">#{cita.id}</td>
                          <td className="px-3 py-2">{cita.nombrePaciente}</td>
                          <td className="px-3 py-2">{new Date(cita.fechaHoraInicioPlan).toLocaleString()}</td>
                          <td className="px-3 py-2">{minutos < 0 ? "Ya paso" : `${horas}h`}</td>
                          <td className="px-3 py-2">
                            <Badge variant={dentroVentana ? "secondary" : "outline"}>{dentroVentana ? "Permitida" : "Fuera de rango"}</Badge>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={!dentroVentana || vm.estadoLoadingId === cita.id}
                              onClick={() => vm.cambiarEstado(cita.id, 3, `Cancelada desde portal de cancelaciones (ventana ${ventanaCancelacionHoras}h)`)}
                            >
                              Cancelar
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "bitacora" && (
          <Card>
            <CardHeader>
              <CardTitle>Bitacora operativa</CardTitle>
              <CardDescription>Trazabilidad de agendado, reprogramaciones y cancelaciones por sucursal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="search"
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm md:max-w-sm"
                placeholder="Buscar por accion, detalle o id de cita"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
              />

              {actividadFiltrada.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin actividad para el filtro aplicado.</p>
              ) : (
                <div className="space-y-2">
                  {actividadFiltrada.slice(0, 80).map((item) => (
                    <div key={item.id} className="rounded-lg border bg-background p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">Cita #{item.idCita} · {item.accion}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.fechaCreacion).toLocaleString()}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Usuario: {item.idUsuario ? `#${item.idUsuario}` : "N/A"} · Rol: {item.rolUsuario}</p>
                      <p className="mt-1 text-sm">{item.detalle || "Sin detalle"}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
