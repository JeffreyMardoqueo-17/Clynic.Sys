"use client"

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
    idClinica,
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
  } = usePublicAppointment(initialClinicaId)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Agendar cita</h1>
        <p className="text-sm text-muted-foreground">
          Completa tus datos y elige fecha, sucursal y servicios.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Clínica</CardTitle>
          <CardDescription>
            Ingresa el ID de clínica para cargar sucursales y servicios disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="idClinica">ID de clínica</Label>
            <Input
              id="idClinica"
              type="number"
              min={1}
              value={idClinicaInput}
              onChange={(event) => setIdClinicaInput(event.target.value)}
              placeholder="Ejemplo: 1"
            />
          </div>
          <Button type="button" onClick={() => loadCatalogo(idClinicaInput)} disabled={catalogLoading}>
            {catalogLoading ? "Cargando..." : "Cargar catálogo"}
          </Button>
        </CardContent>
      </Card>

      {catalogError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{catalogError}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Datos para tu cita</CardTitle>
          <CardDescription>
            Este registro inicial es para agendar. Luego la clínica completa el expediente clínico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="fechaHora">Fecha y hora *</Label>
              <Input
                id="fechaHora"
                type="datetime-local"
                value={fechaHoraInicioPlan}
                onChange={(e) => setFechaHoraInicioPlan(e.target.value)}
              />
            </div>
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
          </div>

          <div className="space-y-2">
            <Label>Servicios *</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {(catalogo?.servicios ?? []).map((servicio) => {
                const checked = idsServicios.includes(servicio.id)
                return (
                  <label
                    key={servicio.id}
                    className="border-border flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm"
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

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
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

          <Button type="button" disabled={!canSubmit || submitLoading} onClick={submitPublicAppointment}>
            {submitLoading ? "Agendando..." : "Agendar cita"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
