"use client"

import { ListPlus, Trash2, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAppointmentServicesPage } from "@/app/(protected)/appointment-services/hooks/use-appointment-services-page"

export function AppointmentServicesManagement() {
  const vm = useAppointmentServicesPage()

  if (vm.loading) {
    return <p className="text-sm text-muted-foreground">Cargando detalle de servicios por cita...</p>
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold"><Wrench className="size-7" /> Cita Servicios</h1>
        <p className="text-sm text-muted-foreground">
          Administra servicios asociados a una cita y recalcula duración/montos automáticamente.
        </p>
      </header>

      {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Cita seleccionada</CardTitle>
          <CardDescription>Elige la cita para consultar y editar su detalle de servicios</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cita</label>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={vm.idCitaSeleccionada || ""}
              onChange={(e) => vm.setIdCitaSeleccionada(Number(e.target.value))}
            >
              <option value="">Selecciona</option>
              {vm.citas.map((cita) => (
                <option key={cita.id} value={cita.id}>
                  #{cita.id} - {cita.nombrePaciente} - {new Date(cita.fechaHoraInicioPlan).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {vm.citaSeleccionada && (
            <div className="space-y-1 rounded-md border p-3 text-sm">
              <p><span className="font-medium">Paciente:</span> {vm.citaSeleccionada.nombrePaciente}</p>
              <p><span className="font-medium">Total:</span> {vm.citaSeleccionada.totalFinal.toFixed(2)}</p>
              <p><span className="font-medium">Inicio:</span> {new Date(vm.citaSeleccionada.fechaHoraInicioPlan).toLocaleString()}</p>
              <p><span className="font-medium">Fin:</span> {new Date(vm.citaSeleccionada.fechaHoraFinPlan).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListPlus className="size-5" /> Agregar servicio a cita</CardTitle>
          <CardDescription>Solo Admin y Recepcionista pueden agregar o eliminar</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Servicio</label>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={vm.idServicioCrear || ""}
              onChange={(e) => vm.setIdServicioCrear(Number(e.target.value))}
              disabled={!vm.canEdit}
            >
              <option value="">Selecciona</option>
              {vm.serviciosDisponibles.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombreServicio}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duración (min)</label>
            <Input
              type="number"
              value={vm.duracionMinCrear}
              onChange={(e) => vm.setDuracionMinCrear(e.target.value)}
              placeholder="Opcional"
              disabled={!vm.canEdit}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Precio</label>
            <Input
              type="number"
              step="0.01"
              value={vm.precioCrear}
              onChange={(e) => vm.setPrecioCrear(e.target.value)}
              placeholder="Opcional"
              disabled={!vm.canEdit}
            />
          </div>

          <div className="md:col-span-4">
            <Button type="button" onClick={vm.crearDetalle} disabled={vm.saving || !vm.canEdit}>
              {vm.saving ? "Agregando..." : "Agregar servicio"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de servicios</CardTitle>
          <CardDescription>{vm.detalles.length} servicio(s) en la cita</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {vm.detalles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay servicios cargados para esta cita.</p>
          ) : (
            <table className="w-full min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Servicio</th>
                  <th className="p-2">Duración</th>
                  <th className="p-2">Precio</th>
                  <th className="p-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {vm.detalles.map((detalle) => (
                  <tr key={detalle.id} className="border-b">
                    <td className="p-2">{detalle.nombreServicio}</td>
                    <td className="p-2">{detalle.duracionMin} min</td>
                    <td className="p-2">{detalle.precio.toFixed(2)}</td>
                    <td className="p-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => vm.eliminarDetalle(detalle.id)}
                        disabled={!vm.canEdit || vm.removingId === detalle.id}
                      >
                        <Trash2 className="size-4" />
                        {vm.removingId === detalle.id ? "Eliminando..." : "Eliminar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
