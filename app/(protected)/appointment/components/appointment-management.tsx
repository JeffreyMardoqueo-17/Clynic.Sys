"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CalendarDays, CalendarPlus, List, ListFilter, History, Sparkles, UserRoundCheck, Stethoscope, CircleCheckBig } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AppointmentBigCalendar } from "@/components/calendar/appointment-big-calendar"
import { ReceptionFlowView } from "./reception-flow-view"
import { DoctorConsultationWorkbench } from "./doctor-consultation-workbench"
import { useAppointmentPage } from "@/app/(protected)/appointment/hooks/use-appointment-page"

function estadoLabel(estado: number) {
  if (estado === 1) return "Pendiente"
  if (estado === 2) return "Confirmada"
  if (estado === 3) return "Cancelada"
  if (estado === 4) return "Completada"
  if (estado === 5) return "Presente"
  if (estado === 6) return "En consulta"
  return "N/A"
}

function estadoBadgeClass(estado: number) {
  if (estado === 1) return "appointment-pill-pendiente"
  if (estado === 2) return "appointment-pill-confirmada"
  if (estado === 3) return "appointment-pill-cancelada"
  if (estado === 4) return "appointment-pill-completada"
  if (estado === 5) return "appointment-pill-confirmada"
  if (estado === 6) return "appointment-pill-neutral"
  return "appointment-pill-neutral"
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

function inDateRange(date: Date, fromDate: string, toDate: string) {
  const start = fromDate ? new Date(`${fromDate}T00:00:00`) : null
  const end = toDate ? new Date(`${toDate}T23:59:59`) : null

  if (start && date < start) return false
  if (end && date > end) return false
  return true
}

export function AppointmentManagement() {
  const vm = useAppointmentPage()
  const VISTA_KEY = "clynic:appointment:vistaActiva:v1"
  const HISTORIAL_KEY = "clynic:appointment:historialFiltros:v1"
  const MODAL_KEY = "clynic:appointment:agendarModalOpen:v1"
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.toString()

  const [historialDesde, setHistorialDesde] = useState("")
  const [historialHasta, setHistorialHasta] = useState("")
  const [vistaActiva, setVistaActiva] = useState<"flujo" | "tabla" | "calendario" | "semana" | "historial">("flujo")
  const [agendarModalOpen, setAgendarModalOpen] = useState(false)

  useEffect(() => {
    try {
      const savedVista = window.localStorage.getItem(VISTA_KEY)
      if (savedVista === "flujo" || savedVista === "tabla" || savedVista === "calendario" || savedVista === "semana" || savedVista === "historial") {
        setVistaActiva(savedVista)
      }

      const savedHistorial = window.localStorage.getItem(HISTORIAL_KEY)
      if (savedHistorial) {
        const parsed = JSON.parse(savedHistorial) as { historialDesde?: string; historialHasta?: string }
        setHistorialDesde(parsed.historialDesde ?? "")
        setHistorialHasta(parsed.historialHasta ?? "")
      }

      const savedModal = window.localStorage.getItem(MODAL_KEY)
      if (vm.canCreateInternal && savedModal === "1") {
        setAgendarModalOpen(true)
      }
    } catch {
    }
  }, [vm.canCreateInternal])

  useEffect(() => {
    const vistaFromQuery = searchParams.get("vista")
    if (vistaFromQuery === "flujo" || vistaFromQuery === "tabla" || vistaFromQuery === "calendario" || vistaFromQuery === "semana" || vistaFromQuery === "historial") {
      setVistaActiva(vistaFromQuery)
    }

    const modalFromQuery = searchParams.get("modal")
    if (vm.canCreateInternal && modalFromQuery === "agendar") {
      setAgendarModalOpen(true)
    }
  }, [searchParams, vm.canCreateInternal])

  useEffect(() => {
    window.localStorage.setItem(VISTA_KEY, vistaActiva)
  }, [vistaActiva])

  useEffect(() => {
    window.localStorage.setItem(MODAL_KEY, agendarModalOpen ? "1" : "0")
  }, [agendarModalOpen])

  useEffect(() => {
    window.localStorage.setItem(
      HISTORIAL_KEY,
      JSON.stringify({
        historialDesde,
        historialHasta,
      })
    )
  }, [historialDesde, historialHasta])

  useEffect(() => {
    const params = new URLSearchParams(currentQuery)

    if (vistaActiva === "flujo") {
      params.delete("vista")
    } else {
      params.set("vista", vistaActiva)
    }

    if (agendarModalOpen && vm.canCreateInternal) {
      params.set("modal", "agendar")
    } else {
      params.delete("modal")
    }

    const nextQuery = params.toString()
    if (nextQuery === currentQuery) return

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
  }, [vistaActiva, agendarModalOpen, vm.canCreateInternal, router, pathname, currentQuery])

  const citasActuales = useMemo(() => {
    return vm.citas
      .filter((cita) => cita.estado !== 3 && cita.estado !== 4)
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())
  }, [vm.citas])

  const historialCitas = useMemo(() => {
    const ahora = Date.now()

    return vm.citasTodas
      .filter((cita) => new Date(cita.fechaHoraInicioPlan).getTime() < ahora)
      .filter((cita) => inDateRange(new Date(cita.fechaHoraInicioPlan), historialDesde, historialHasta))
      .sort((a, b) => new Date(b.fechaHoraInicioPlan).getTime() - new Date(a.fechaHoraInicioPlan).getTime())
  }, [vm.citasTodas, historialDesde, historialHasta])

  const citasCalendario = useMemo(
    () => [...vm.citasTodas].sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime()),
    [vm.citasTodas]
  )

  const resumenFlujo = useMemo(() => {
    const pendientes = vm.citas.filter((c) => c.estado === 1 || c.estado === 2).length
    const presentes = vm.citas.filter((c) => c.estado === 5).length
    const enConsulta = vm.citas.filter((c) => c.estado === 6).length
    const completadasHoy = vm.citas.filter((c) => c.estado === 4).length

    return { pendientes, presentes, enConsulta, completadasHoy }
  }, [vm.citas])

  const citasPorEspecialidadHoy = useMemo(() => {
    const agrupadas = new Map<string, number>()
    for (const cita of vm.citas) {
      const key = cita.nombreEspecialidad || `Especialidad #${cita.idEspecialidad}`
      agrupadas.set(key, (agrupadas.get(key) ?? 0) + 1)
    }

    return Array.from(agrupadas.entries()).sort((a, b) => b[1] - a[1])
  }, [vm.citas])

  const maxCitasEspecialidadHoy = useMemo(
    () => Math.max(...citasPorEspecialidadHoy.map(([, total]) => total), 0),
    [citasPorEspecialidadHoy]
  )

  const citasSemanaProximas = useMemo(() => {
    const ahora = new Date()
    const limite = new Date(ahora)
    limite.setDate(limite.getDate() + 7)

    return [...vm.citasTodas]
      .filter((cita) => {
        const inicio = new Date(cita.fechaHoraInicioPlan)
        return inicio >= ahora && inicio <= limite && cita.estado !== 3
      })
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())
  }, [vm.citasTodas])

  if (vm.loading) {
    return <p className="text-sm text-muted-foreground">Cargando módulo de citas...</p>
  }

  if (["Doctor", "Nutricionista", "Fisioterapeuta"].includes(vm.role)) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="flex items-center gap-2 text-3xl font-bold"><CalendarDays className="size-7" /> Consulta médica</h1>
          <p className="text-sm text-muted-foreground">
            Vista exclusiva para doctor: revisa pacientes transferidos por recepción, abre el caso y registra la consulta.
          </p>
          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            Flujo recomendado: 1) Recepción marca llegada (Presente), 2) doctor toma paciente por orden y especialidad, 3) doctor registra consulta y recepción coordina cierre/seguimiento.
          </div>
        </header>

        {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

        <DoctorConsultationWorkbench
          idUsuario={vm.idUsuario}
          idEspecialidadUsuario={vm.idEspecialidadUsuario}
          citas={citasActuales}
          sucursales={vm.sucursales}
          citasDoctorEnConsulta={vm.citasDoctorEnConsulta}
          siguienteCitaDoctor={vm.siguienteCitaDoctor}
          citaDoctorActiva={vm.citaDoctorActiva}
          tomandoSiguienteDoctor={vm.tomandoSiguienteDoctor}
          tomarSiguientePacienteDoctor={vm.tomarSiguientePacienteDoctor}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="relative overflow-hidden rounded-2xl border bg-linear-to-r from-cyan-600 via-sky-600 to-indigo-600 p-5 text-white shadow-sm">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 left-14 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold"><CalendarDays className="size-7" /> Citas</h1>
              <p className="text-sm text-white/90">
                Flujo del día: recepción marca llegada, doctor toma por orden y especialidad, consulta se refleja en tiempo real.
              </p>
            </div>
            <Badge className="w-fit border-white/30 bg-white/15 text-white hover:bg-white/20">
              <Sparkles className="mr-1 size-3.5" /> Flujo en vivo
            </Badge>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">Pendiente</Badge>
          <Badge variant="secondary">Confirmada</Badge>
          <Badge>Presente</Badge>
          <Badge variant="ghost">En consulta</Badge>
          <Badge variant="destructive">Cancelada</Badge>
          <Badge>Completada</Badge>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2"><History className="size-4" /> Pendientes</span>
              <Badge variant="outline">{resumenFlujo.pendientes}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Aún no han llegado o están confirmadas</p></CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2"><UserRoundCheck className="size-4" /> En recepción</span>
              <Badge variant="secondary">{resumenFlujo.presentes}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Listas para ser tomadas por el doctor</p></CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2"><Stethoscope className="size-4" /> En consulta</span>
              <Badge>{resumenFlujo.enConsulta}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Atención clínica en progreso</p></CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2"><CircleCheckBig className="size-4" /> Completadas hoy</span>
              <Badge variant="secondary">{resumenFlujo.completadasHoy}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Consultas cerradas durante la jornada</p></CardContent>
        </Card>
      </div>

      {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Citas agendadas hoy por especialidad</CardTitle>
          <CardDescription>
            Carga del dia por especialidad (ordenada de mayor a menor) con los filtros actuales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {citasPorEspecialidadHoy.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay citas agendadas hoy.</p>
          ) : (
            <div className="space-y-3">
              {citasPorEspecialidadHoy.map(([especialidad, total]) => {
                const porcentaje = maxCitasEspecialidadHoy > 0
                  ? Math.round((total / maxCitasEspecialidadHoy) * 100)
                  : 0

                return (
                  <div key={especialidad} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{especialidad}</span>
                      <span className="text-muted-foreground">{total} cita{total === 1 ? "" : "s"}</span>
                    </div>
                    <Progress value={porcentaje} className="h-2" aria-label={`Carga de ${especialidad}: ${total} citas`} />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Vista activa</p>
        <Breadcrumb>
          <BreadcrumbList className="text-base md:text-lg">
            <BreadcrumbItem>
              {vistaActiva === "flujo" ? (
                <BreadcrumbPage className="font-semibold">Flujo</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="#"
                  className="font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    setVistaActiva("flujo")
                  }}
                >
                  Flujo
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {vistaActiva === "tabla" ? (
                <BreadcrumbPage className="font-semibold">Tabla</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="#"
                  className="font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    setVistaActiva("tabla")
                  }}
                >
                  Tabla
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {vistaActiva === "calendario" ? (
                <BreadcrumbPage className="font-semibold">Calendario</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="#"
                  className="font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    setVistaActiva("calendario")
                  }}
                >
                  Calendario
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {vistaActiva === "semana" ? (
                <BreadcrumbPage className="font-semibold">Semana</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="#"
                  className="font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    setVistaActiva("semana")
                  }}
                >
                  Semana
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {vistaActiva === "historial" ? (
                <BreadcrumbPage className="font-semibold">Historial</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="#"
                  className="font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    setVistaActiva("historial")
                  }}
                >
                  Historial
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListFilter className="size-5" /> Filtros</CardTitle>
          <CardDescription>Filtra agenda por estado y fecha</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {vm.canFilterBySucursal && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Sucursal</label>
              <select
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={vm.idSucursalFiltro}
                onChange={(e) =>
                  vm.setIdSucursalFiltro(e.target.value === "all" ? "all" : Number(e.target.value))
                }
              >
                <option value="all">Todas</option>
                {vm.sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!vm.canFilterBySucursal && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Sucursal asignada</label>
              <p className="border-input bg-background rounded-md border px-3 py-2 text-sm">
                {vm.sucursales.find((s) => s.id === vm.idSucursalUsuario)?.nombre ?? "Sucursal asignada"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={vm.estadoFiltro}
              onChange={(e) =>
                vm.setEstadoFiltro(e.target.value === "all" ? "all" : Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6)
              }
            >
              <option value="all">Todos</option>
              <option value={1}>Pendiente</option>
              <option value={2}>Confirmada</option>
              <option value={5}>Presente</option>
              <option value={6}>En consulta</option>
              <option value={3}>Cancelada</option>
              <option value={4}>Completada</option>
            </select>
          </div>

          <div className="flex items-end justify-end">
            {vm.canCreateInternal && (
              <Dialog
                open={agendarModalOpen}
                onOpenChange={(open) => setAgendarModalOpen(open)}
              >
                <DialogTrigger asChild>
                  <Button type="button" className="w-full md:w-auto">
                    <CalendarPlus className="size-4" />
                    Agendar cita
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Agendar cita completa</DialogTitle>
                    <DialogDescription>
                      Registro interno completo para recepción/admin.
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

                        <p className="text-xs text-muted-foreground">
                          Si el paciente no existe en la lista, regístralo aquí y quedará seleccionado automáticamente.
                        </p>

                        <div className="rounded-md border bg-muted/30 p-3">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Registrar nuevo paciente</p>
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
                              placeholder="Teléfono"
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

                    <Button type="button" onClick={vm.crearCitaInterna} disabled={vm.createLoading || vm.disponibilidadCrearLoading || (vm.disponibilidadCrear !== null && vm.cuposDisponiblesCrear <= 0)}>
                      <CalendarPlus className="size-4" />
                      {vm.createLoading ? "Agendando..." : "Agendar cita"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

        </CardContent>
      </Card>

      {vistaActiva === "flujo" && (
      (
        <ReceptionFlowView
          role={vm.role}
          citas={citasActuales}
          sucursales={vm.sucursales}
          estadoLoadingId={vm.estadoLoadingId}
          consultaLoading={vm.consultaLoading}
          canCreateInternal={vm.canCreateInternal}
          marcarPresente={vm.marcarPresente}
          pasarAConsulta={vm.pasarAConsulta}
          cerrarProcesoRecepcion={vm.cerrarProcesoRecepcion}
          setIdCitaConsulta={vm.setIdCitaConsulta}
          agendarSeguimiento={vm.agendarSeguimiento}
          abrirConsultaEnVistaTabla={(idCita: number) => {
            vm.setIdCitaConsulta(idCita)
            setVistaActiva("tabla")
          }}
        />
      )
      )}

      {vistaActiva === "tabla" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><List className="size-5" /> Lista de citas actuales</CardTitle>
          <CardDescription>{citasActuales.length} cita(s) vigente(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {citasActuales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay citas actuales.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">ID</th>
                    <th className="p-2">Paciente</th>
                    <th className="p-2">Inicio</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Sucursal</th>
                    <th className="p-2">Especialidad</th>
                    <th className="p-2">Servicios</th>
                    <th className="p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citasActuales.map((cita) => (
                    <tr key={cita.id} className="border-b">
                      <td className="p-2">#{cita.id}</td>
                      <td className="p-2 wrap-break-word">{cita.nombrePaciente}</td>
                      <td className="p-2 wrap-break-word">{new Date(cita.fechaHoraInicioPlan).toLocaleString()}</td>
                      <td className="p-2">
                        <Badge variant={estadoBadgeVariant(cita.estado)} className={estadoBadgeClass(cita.estado)}>
                          {estadoLabel(cita.estado)}
                        </Badge>
                      </td>
                      <td className="p-2 wrap-break-word">{vm.sucursales.find((s) => s.id === cita.idSucursal)?.nombre ?? `Sucursal ${cita.idSucursal}`}</td>
                      <td className="p-2 wrap-break-word">{cita.nombreEspecialidad}</td>
                      <td className="p-2 wrap-break-word">{cita.servicios.map((s) => s.nombreServicio).join(", ")}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-2">
                          {(["admin", "recepcionista"].includes(String(vm.role ?? "").toLowerCase()) && (cita.estado === 1 || cita.estado === 2)) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => vm.marcarPresente(cita.id)}
                              disabled={vm.estadoLoadingId === cita.id}
                            >
                              {vm.estadoLoadingId === cita.id ? "Actualizando..." : "Marcar presente"}
                            </Button>
                          )}

                          {(["admin", "doctor"].includes(String(vm.role ?? "").toLowerCase()) && cita.estado === 5) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => vm.pasarAConsulta(cita.id)}
                              disabled={vm.estadoLoadingId === cita.id}
                            >
                              {vm.estadoLoadingId === cita.id ? "Actualizando..." : "Tomar turno"}
                            </Button>
                          )}
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

      {vistaActiva === "tabla" && vm.canRegisterConsult && (
      <Card>
        <CardHeader>
          <CardTitle>Registrar consulta médica</CardTitle>
          <CardDescription>
            Doctor/Admin registra la consulta y la envía a recepción para el cierre final. Si requiere seguimiento, recepción agenda nueva cita y cierra el proceso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cita</label>
              <select
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={vm.idCitaConsulta || ""}
                onChange={(e) => vm.setIdCitaConsulta(Number(e.target.value))}
              >
                <option value="">Selecciona</option>
                {vm.citasSinConsulta
                  .filter((c) => c.estado !== 3 && c.estado !== 4)
                  .map((cita) => (
                    <option key={cita.id} value={cita.id}>
                      #{cita.id} - {cita.nombrePaciente}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Diagnóstico *</label>
              <input
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={vm.diagnostico}
                onChange={(e) => vm.setDiagnostico(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tratamiento</label>
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                value={vm.tratamiento}
                onChange={(e) => vm.setTratamiento(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Receta</label>
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                value={vm.receta}
                onChange={(e) => vm.setReceta(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exámenes solicitados</label>
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                value={vm.examenes}
                onChange={(e) => vm.setExamenes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notas médicas</label>
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                value={vm.notasMedicas}
                onChange={(e) => vm.setNotasMedicas(e.target.value)}
              />
            </div>
          </div>

          <Button type="button" onClick={vm.registrarConsulta} disabled={vm.consultaLoading}>
            {vm.consultaLoading ? "Guardando consulta..." : "Guardar consulta y enviar a recepción"}
          </Button>
        </CardContent>
      </Card>
      )}

      {vistaActiva === "calendario" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="size-5" /> Calendario</CardTitle>
          <CardDescription>Vista completa para navegar todas las citas (pasadas y futuras)</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentBigCalendar citas={citasCalendario} sucursales={vm.sucursales} />
        </CardContent>
      </Card>
      )}

      {vistaActiva === "semana" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="size-5" /> Próximos 7 días</CardTitle>
          <CardDescription>Citas agendadas para la semana siguiente</CardDescription>
        </CardHeader>
        <CardContent>
          {citasSemanaProximas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay citas próximas en los siguientes 7 días.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">ID</th>
                    <th className="p-2">Paciente</th>
                    <th className="p-2">Inicio</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Sucursal</th>
                  </tr>
                </thead>
                <tbody>
                  {citasSemanaProximas.map((cita) => (
                    <tr key={cita.id} className="border-b">
                      <td className="p-2">#{cita.id}</td>
                      <td className="p-2 wrap-break-word">{cita.nombrePaciente}</td>
                      <td className="p-2 wrap-break-word">{new Date(cita.fechaHoraInicioPlan).toLocaleString()}</td>
                      <td className="p-2">
                        <Badge variant={estadoBadgeVariant(cita.estado)} className={estadoBadgeClass(cita.estado)}>
                          {estadoLabel(cita.estado)}
                        </Badge>
                      </td>
                      <td className="p-2 wrap-break-word">{vm.sucursales.find((s) => s.id === cita.idSucursal)?.nombre ?? `Sucursal ${cita.idSucursal}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {vistaActiva === "historial" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="size-5" /> Historial de citas</CardTitle>
          <CardDescription>Filtra citas pasadas por rango de fechas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Desde</label>
              <input
                type="date"
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={historialDesde}
                onChange={(e) => setHistorialDesde(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hasta</label>
              <input
                type="date"
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={historialHasta}
                onChange={(e) => setHistorialHasta(e.target.value)}
              />
            </div>
          </div>

          {historialCitas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay citas en el historial para ese rango.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">ID</th>
                    <th className="p-2">Paciente</th>
                    <th className="p-2">Fecha</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Sucursal</th>
                    <th className="p-2">Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  {historialCitas.map((cita) => (
                    <tr key={cita.id} className="border-b">
                      <td className="p-2">#{cita.id}</td>
                      <td className="p-2 wrap-break-word">{cita.nombrePaciente}</td>
                      <td className="p-2 wrap-break-word">{new Date(cita.fechaHoraInicioPlan).toLocaleString()}</td>
                      <td className="p-2">
                        <Badge variant={estadoBadgeVariant(cita.estado)} className={estadoBadgeClass(cita.estado)}>
                          {estadoLabel(cita.estado)}
                        </Badge>
                      </td>
                      <td className="p-2 wrap-break-word">{vm.sucursales.find((s) => s.id === cita.idSucursal)?.nombre ?? `Sucursal ${cita.idSucursal}`}</td>
                      <td className="p-2">{cita.idDoctor ?? "Sin asignar"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  )
}
