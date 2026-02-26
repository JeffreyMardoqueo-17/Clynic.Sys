"use client"

import { useMemo } from "react"
import { CalendarDays, CalendarPlus, CircleCheck, CircleDashed, CircleX, Clock3, ListFilter } from "lucide-react"
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
import { AppointmentBigCalendar } from "@/components/calendar/appointment-big-calendar"
import { useAppointmentPage } from "@/app/(protected)/appointment/hooks/use-appointment-page"

function estadoLabel(estado: number) {
  if (estado === 1) return "Pendiente"
  if (estado === 2) return "Confirmada"
  if (estado === 3) return "Cancelada"
  if (estado === 4) return "Completada"
  return "N/A"
}

function estadoBadgeClass(estado: number) {
  if (estado === 1) return "appointment-pill-pendiente"
  if (estado === 2) return "appointment-pill-confirmada"
  if (estado === 3) return "appointment-pill-cancelada"
  if (estado === 4) return "appointment-pill-completada"
  return "appointment-pill-neutral"
}

export function AppointmentManagement() {
  const vm = useAppointmentPage()

  const proximasCitas = useMemo(() => {
    const ahora = Date.now()
    return vm.citas
      .filter((cita) => new Date(cita.fechaHoraInicioPlan).getTime() >= ahora && cita.estado !== 3)
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())
      .slice(0, 5)
  }, [vm.citas])

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
          <span className="appointment-pill appointment-pill-pendiente"><CircleDashed className="size-3.5" /> Pendiente</span>
          <span className="appointment-pill appointment-pill-confirmada"><CircleCheck className="size-3.5" /> Confirmada</span>
          <span className="appointment-pill appointment-pill-cancelada"><CircleX className="size-3.5" /> Cancelada</span>
          <span className="appointment-pill appointment-pill-completada"><Clock3 className="size-3.5" /> Completada</span>
        </div>
      </header>

      {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

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
                vm.setEstadoFiltro(e.target.value === "all" ? "all" : Number(e.target.value) as 1 | 2 | 3 | 4)
              }
            >
              <option value="all">Todos</option>
              <option value={1}>Pendiente</option>
              <option value={2}>Confirmada</option>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Calendario de citas</CardTitle>
            <CardDescription>Vista mensual, semanal, diaria y agenda</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentBigCalendar citas={vm.citas} sucursales={vm.sucursales} />
          </CardContent>
        </Card>

        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Quién sigue</CardTitle>
            <CardDescription>Próximas {proximasCitas.length} citas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximasCitas.length === 0 && <p className="text-muted-foreground text-sm">Sin próximas citas.</p>}
            {proximasCitas.map((cita) => (
              <div key={cita.id} className="appointment-next-item rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <span className={`appointment-pill ${estadoBadgeClass(cita.estado)}`}>
                    {estadoLabel(cita.estado)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(cita.fechaHoraInicioPlan).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda</CardTitle>
          <CardDescription>{vm.citas.length} cita(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {vm.citas.map((cita) => (
              <div key={cita.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">#{cita.id} · {cita.nombrePaciente}</p>
                  <span className={`appointment-pill ${estadoBadgeClass(cita.estado)}`}>
                    {estadoLabel(cita.estado)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(cita.fechaHoraInicioPlan).toLocaleString()}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {vm.sucursales.find((s) => s.id === cita.idSucursal)?.nombre ?? `Sucursal ${cita.idSucursal}`}
                </p>
                <p className="mt-1 text-xs">Servicios: {cita.servicios.map((s) => s.nombreServicio).join(", ")}</p>
              </div>
            ))}
          </div>

          <table className="hidden w-full table-fixed text-sm md:table">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Paciente</th>
                <th className="p-2">Sucursal</th>
                <th className="p-2">Inicio</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Doctor</th>
                <th className="p-2">Servicios</th>
                {vm.canCreateInternal && <th className="p-2">Asignar doctor</th>}
              </tr>
            </thead>
            <tbody>
              {vm.citas.map((cita) => (
                <tr key={cita.id} className="border-b">
                  <td className="p-2">#{cita.id}</td>
                  <td className="p-2 wrap-break-word">{cita.nombrePaciente}</td>
                  <td className="p-2 wrap-break-word">{vm.sucursales.find((s) => s.id === cita.idSucursal)?.nombre ?? cita.idSucursal}</td>
                  <td className="p-2 wrap-break-word">{new Date(cita.fechaHoraInicioPlan).toLocaleString()}</td>
                  <td className="p-2">
                    <span className={`appointment-pill ${estadoBadgeClass(cita.estado)}`}>
                      {estadoLabel(cita.estado)}
                    </span>
                  </td>
                  <td className="p-2">{cita.idDoctor ?? "Sin asignar"}</td>
                  <td className="p-2 wrap-break-word">{cita.servicios.map((s) => s.nombreServicio).join(", ")}</td>
                  {vm.canCreateInternal && (
                    <td className="p-2">
                      <select
                        className="border-input bg-background rounded-md border px-2 py-1"
                        defaultValue={cita.idDoctor ?? "none"}
                        disabled={vm.asignarLoading}
                        onChange={(e) =>
                          vm.asignarDoctor(
                            cita.id,
                            e.target.value === "none" ? undefined : Number(e.target.value)
                          )
                        }
                      >
                        <option value="none">Sin doctor</option>
                        {vm.doctores.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.nombreCompleto}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
