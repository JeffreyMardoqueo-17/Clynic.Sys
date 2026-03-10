"use client"

import { Building2, CalendarClock, ClipboardList, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePublicAppointment } from "@/app/agendar-cita/hooks/use-public-appointment"

type PublicAppointmentFormProps = {
  initialClinicaId?: number
}

export function PublicAppointmentForm({ initialClinicaId }: PublicAppointmentFormProps) {
  const {
    clinicas,
    clinicasLoading,
    clinicasError,
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
  } = usePublicAppointment(initialClinicaId)

  const sucursalSeleccionada = (catalogo?.sucursales ?? []).find((sucursal) => sucursal.id === idSucursal)
  const especialidadesSucursal = (catalogo?.especialidadesPorSucursal ?? []).filter((item) => item.idSucursal === idSucursal)
  const especialidadSeleccionada = especialidadesSucursal.find((item) => item.idEspecialidad === idEspecialidad)
  const serviciosSeleccionados = (catalogo?.servicios ?? []).filter((servicio) => idsServicios.includes(servicio.id))
  const puedeConsultarHorarios = idSucursal > 0 && idEspecialidad > 0 && idsServicios.length > 0

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Agendar cita</h1>
        <p className="text-sm text-muted-foreground">
          Flujo rápido: 1) Clínica, 2) Sucursal y servicios, 3) Hora disponible, 4) Confirmar.
        </p>
      </header>

      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Clínica
          </CardTitle>
          <CardDescription>
            Selecciona la clínica para cargar sucursales y servicios disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="idClinica">Clínica</Label>
            <select
              id="idClinica"
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={idClinicaInput}
              onChange={(event) => setIdClinicaInput(event.target.value)}
              disabled={clinicasLoading}
            >
              <option value="">{clinicasLoading ? "Cargando clínicas..." : "Selecciona una clínica"}</option>
              {clinicas.map((clinica) => (
                <option key={clinica.id} value={String(clinica.id)}>
                  {clinica.nombre}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" onClick={() => loadCatalogo(idClinicaInput)} disabled={catalogLoading}>
            {catalogLoading ? "Cargando..." : "Cargar catálogo"}
          </Button>
        </CardContent>
      </Card>

      {clinicasError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{clinicasError}</p>}

      {catalogError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{catalogError}</p>}
  {catalogWarning && <p className="rounded-md bg-amber-500/10 p-3 text-sm text-amber-700">{catalogWarning}</p>}

      <Card className="border-l-4 border-l-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Datos para tu cita
          </CardTitle>
          <CardDescription>
            Completa los pasos en orden. La hora se habilita cuando selecciones sucursal y servicios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            Paso 1: Datos personales · Paso 2: Sucursal y servicios · Paso 3: Día y hora disponible.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres *</Label>
              <Input id="nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input id="apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo *</Label>
              <Input id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Servicios *
            </Label>
            {idSucursal > 0 && (catalogo?.servicios?.length ?? 0) === 0 && (
              <p className="rounded-md bg-amber-500/10 p-2 text-xs text-amber-700">
                No hay servicios activos para esta clínica. Debes crear/activar servicios en el panel administrativo.
              </p>
            )}
            <div className="grid gap-2 md:grid-cols-2">
              {(catalogo?.servicios ?? []).map((servicio) => {
                const checked = idsServicios.includes(servicio.id)
                return (
                  <label
                    key={servicio.id}
                    className="border-border hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm transition-colors"
                  >
                    <span>
                      {servicio.nombreServicio} · {servicio.duracionMin} min
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleServicio(servicio.id)}
                    />
                  </label>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sucursal">Sucursal *</Label>
              <select
                id="sucursal"
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={idSucursal || ""}
                onChange={(e) => setIdSucursal(Number(e.target.value))}
              >
                <option value="">Selecciona una sucursal</option>
                {(catalogo?.sucursales ?? []).map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad *</Label>
              <select
                id="especialidad"
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={idEspecialidad || ""}
                onChange={(e) => setIdEspecialidad(Number(e.target.value))}
                disabled={!idSucursal}
              >
                <option value="">Selecciona una especialidad</option>
                {especialidadesSucursal.map((especialidad) => (
                  <option key={`${especialidad.idSucursal}-${especialidad.idEspecialidad}`} value={especialidad.idEspecialidad}>
                    {especialidad.nombreEspecialidad}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaAgenda">Día *</Label>
              <Input
                id="fechaAgenda"
                type="date"
                value={fechaAgenda}
                onChange={(e) => setFechaAgenda(e.target.value)}
                disabled={!puedeConsultarHorarios}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaDisponible">Hora disponible *</Label>
              <select
                id="horaDisponible"
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={fechaHoraInicioPlan}
                onChange={(e) => setFechaHoraInicioPlan(e.target.value)}
                disabled={!puedeConsultarHorarios || disponibilidadLoading || !disponibilidad || disponibilidad.horarios.length === 0}
              >
                <option value="">
                  {!puedeConsultarHorarios
                    ? "Completa sucursal, especialidad y servicios"
                    : disponibilidadLoading
                    ? "Calculando disponibilidad..."
                    : "Selecciona una hora"}
                </option>
                {(disponibilidad?.horarios ?? []).map((slot) => (
                  <option key={slot.fechaHoraInicioPlan} value={slot.fechaHoraInicioPlan.slice(0, 16)}>
                    {slot.horaLabel}
                  </option>
                ))}
              </select>
              {!disponibilidadLoading && (!idSucursal || !idEspecialidad || idsServicios.length === 0) && (
                <p className="text-xs text-muted-foreground">
                  Primero selecciona sucursal, especialidad y al menos un servicio para ver horas disponibles.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-md border bg-card p-3 text-xs">
            <p className="font-medium">Resumen</p>
            <p className="text-muted-foreground">Sucursal: {sucursalSeleccionada?.nombre ?? "No seleccionada"}</p>
            <p className="text-muted-foreground">Especialidad: {especialidadSeleccionada?.nombreEspecialidad ?? "No seleccionada"}</p>
            <p className="text-muted-foreground">Servicios: {serviciosSeleccionados.length > 0 ? serviciosSeleccionados.map((s) => s.nombreServicio).join(", ") : "No seleccionados"}</p>
            <p className="text-muted-foreground">Duración estimada: {disponibilidad?.duracionEstimadaMin ?? 0} min</p>
          </div>

          {disponibilidad && (
            <p className="rounded-md bg-primary/5 p-2 text-xs text-primary">
              Cupo diario de especialidad: {disponibilidad.citasMaximasPorDiaEspecialidad} · Agendadas: {disponibilidad.citasOcupadasDiaEspecialidad} · Disponibles: {cuposDisponiblesEspecialidad}
            </p>
          )}

          {disponibilidadError && (
            <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{disponibilidadError}</p>
          )}

          {!disponibilidadLoading && disponibilidad && disponibilidad.horarios.length === 0 && (
            <p className="rounded-md bg-amber-500/10 p-2 text-xs text-amber-700">
              No hay horarios disponibles para ese día con los servicios seleccionados.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="notas" className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" />
              Notas
            </Label>
            <textarea
              id="notas"
              className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Si necesitas agregar algún detalle para la cita"
            />
          </div>

          {submitError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}
          {submitSuccess && <p className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700">{submitSuccess}</p>}

          <Button type="button" disabled={!canSubmit || submitLoading || (disponibilidad !== null && cuposDisponiblesEspecialidad <= 0)} onClick={submitPublicAppointment}>
            {submitLoading ? "Agendando..." : "Agendar cita"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
