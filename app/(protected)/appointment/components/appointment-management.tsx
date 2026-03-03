"use client"

import { useMemo, useState } from "react"
import { CalendarDays, CalendarPlus, List, ListFilter, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [historialDesde, setHistorialDesde] = useState("")
  const [historialHasta, setHistorialHasta] = useState("")
  const [vistaActiva, setVistaActiva] = useState<"flujo" | "tabla" | "calendario" | "historial">("flujo")

  const citasActuales = useMemo(() => {
    const ahora = Date.now()

    return vm.citas
      .filter((cita) => new Date(cita.fechaHoraInicioPlan).getTime() >= ahora && cita.estado !== 3)
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())
  }, [vm.citas])

  const historialCitas = useMemo(() => {
    const ahora = Date.now()

    return vm.citas
      .filter((cita) => new Date(cita.fechaHoraInicioPlan).getTime() < ahora)
      .filter((cita) => inDateRange(new Date(cita.fechaHoraInicioPlan), historialDesde, historialHasta))
      .sort((a, b) => new Date(b.fechaHoraInicioPlan).getTime() - new Date(a.fechaHoraInicioPlan).getTime())
  }, [vm.citas, historialDesde, historialHasta])

  if (vm.loading) {
    return <p className="text-sm text-muted-foreground">Cargando módulo de citas...</p>
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold"><CalendarDays className="size-7" /> Citas</h1>
        <p className="text-sm text-muted-foreground">
          Citas agendadas, gestión de agenda y asignación de doctores por recepción/admin.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">Pendiente</Badge>
          <Badge variant="secondary">Confirmada</Badge>
          <Badge>Presente</Badge>
          <Badge variant="ghost">En consulta</Badge>
          <Badge variant="destructive">Cancelada</Badge>
          <Badge>Completada</Badge>
        </div>
      </header>

      {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

      <div className="rounded-lg border p-4">
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

      <Card className="border-0 bg-transparent shadow-none">
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
              <Dialog>
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
                          {vm.doctores.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.nombreCompleto}
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notas</label>
                      <textarea
                        className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                        value={vm.notasCrear}
                        onChange={(e) => vm.setNotasCrear(e.target.value)}
                      />
                    </div>

                    <Button type="button" onClick={vm.crearCitaInterna} disabled={vm.createLoading}>
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
      (vm.role === "Doctor" ? (
        <DoctorConsultationWorkbench
          idUsuario={vm.idUsuario}
          citas={citasActuales}
          sucursales={vm.sucursales}
          estadoLoadingId={vm.estadoLoadingId}
          consultaLoading={vm.consultaLoading}
          historialActual={vm.historialActual}
          historialLoading={vm.historialLoading}
          historialSaving={vm.historialSaving}
          formHistorial={vm.formHistorial}
          setFormHistorial={vm.setFormHistorial}
          citasDoctorEnConsulta={vm.citasDoctorEnConsulta}
          siguienteCitaDoctor={vm.siguienteCitaDoctor}
          citaDoctorActiva={vm.citaDoctorActiva}
          abrirCitaDoctor={vm.abrirCitaDoctor}
          pasarAConsulta={vm.pasarAConsulta}
          setIdCitaConsulta={vm.setIdCitaConsulta}
          diagnostico={vm.diagnostico}
          setDiagnostico={vm.setDiagnostico}
          tratamiento={vm.tratamiento}
          setTratamiento={vm.setTratamiento}
          receta={vm.receta}
          setReceta={vm.setReceta}
          examenes={vm.examenes}
          setExamenes={vm.setExamenes}
          notasMedicas={vm.notasMedicas}
          setNotasMedicas={vm.setNotasMedicas}
          registrarConsultaPorCita={vm.registrarConsultaPorCita}
          guardarHistorialPaciente={vm.guardarHistorialPaciente}
          agendarSeguimiento={vm.agendarSeguimiento}
        />
      ) : (
        <ReceptionFlowView
          role={vm.role}
          citas={citasActuales}
          sucursales={vm.sucursales}
          estadoLoadingId={vm.estadoLoadingId}
          consultaLoading={vm.consultaLoading}
          canCreateInternal={vm.canCreateInternal}
          marcarPresente={vm.marcarPresente}
          pasarAConsulta={vm.pasarAConsulta}
          setIdCitaConsulta={vm.setIdCitaConsulta}
          agendarSeguimiento={vm.agendarSeguimiento}
          abrirConsultaEnVistaTabla={(idCita: number) => {
            vm.setIdCitaConsulta(idCita)
            setVistaActiva("tabla")
          }}
        />
      ))
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

                          {(["admin", "recepcionista"].includes(String(vm.role ?? "").toLowerCase()) && cita.estado === 5) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => vm.pasarAConsulta(cita.id)}
                              disabled={vm.estadoLoadingId === cita.id}
                            >
                              {vm.estadoLoadingId === cita.id ? "Actualizando..." : "Pasar a doctor"}
                            </Button>
                          )}

                          {(["admin", "doctor"].includes(String(vm.role ?? "").toLowerCase()) && (cita.estado === 2 || cita.estado === 5)) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => vm.pasarAConsulta(cita.id)}
                              disabled={vm.estadoLoadingId === cita.id}
                            >
                              {vm.estadoLoadingId === cita.id ? "Actualizando..." : "Iniciar consulta"}
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
            Doctor/Admin completa la consulta; al guardar la cita queda completada. Si requiere seguimiento, recepción agenda nueva cita.
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
            {vm.consultaLoading ? "Guardando consulta..." : "Finalizar consulta"}
          </Button>
        </CardContent>
      </Card>
      )}

      {vistaActiva === "calendario" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="size-5" /> Calendario</CardTitle>
          <CardDescription>Vista interactiva para navegar y revisar citas actuales</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentBigCalendar citas={citasActuales} sucursales={vm.sucursales} />
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
