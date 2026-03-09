"use client"

import { FileHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRecordsPage } from "@/app/(protected)/records/hooks/use-records-page"

export function RecordsManagement() {
  const vm = useRecordsPage()

  if (vm.loading) {
    return <p className="text-sm text-muted-foreground">Cargando historial clínico...</p>
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold"><FileHeart className="size-7" /> Historial Clínico</h1>
        <p className="text-sm text-muted-foreground">
          Vista dedicada para consultar y actualizar historial clínico por paciente.
        </p>
      </header>

      {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Búsqueda de paciente</CardTitle>
          <CardDescription>Filtra por nombre, correo o teléfono</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={vm.busqueda}
            onChange={(e) => vm.setBusqueda(e.target.value)}
            placeholder="Buscar paciente..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pacientes</CardTitle>
          <CardDescription>{vm.pacientes.length} registro(s)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Nombre</th>
                <th className="p-2">Correo</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {vm.pacientes.map((paciente) => (
                <tr key={paciente.id} className="border-b">
                  <td className="p-2">{paciente.nombreCompleto}</td>
                  <td className="p-2">{paciente.correo}</td>
                  <td className="p-2">{paciente.telefono || "N/A"}</td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      variant={vm.selectedPaciente?.id === paciente.id ? "default" : "outline"}
                      onClick={() => vm.selectPaciente(paciente)}
                    >
                      {vm.selectedPaciente?.id === paciente.id ? "Seleccionado" : "Abrir historial"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {vm.selectedPaciente && (
        <Card>
          <CardHeader>
            <CardTitle>Historial: {vm.selectedPaciente.nombreCompleto}</CardTitle>
            <CardDescription>
              Última actualización: {vm.historialActual?.fechaActualizacion ? new Date(vm.historialActual.fechaActualizacion).toLocaleString() : "Sin registro"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enfermedades previas</label>
                <textarea
                  className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  value={vm.formHistorial.enfermedadesPrevias}
                  onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, enfermedadesPrevias: e.target.value }))}
                  disabled={!vm.canEdit}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medicamentos actuales</label>
                <textarea
                  className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  value={vm.formHistorial.medicamentosActuales}
                  onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, medicamentosActuales: e.target.value }))}
                  disabled={!vm.canEdit}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alergias</label>
                <textarea
                  className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  value={vm.formHistorial.alergias}
                  onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, alergias: e.target.value }))}
                  disabled={!vm.canEdit}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Antecedentes familiares</label>
                <textarea
                  className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  value={vm.formHistorial.antecedentesFamiliares}
                  onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, antecedentesFamiliares: e.target.value }))}
                  disabled={!vm.canEdit}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Observaciones</label>
                <textarea
                  className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  value={vm.formHistorial.observaciones}
                  onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, observaciones: e.target.value }))}
                  disabled={!vm.canEdit}
                />
              </div>
            </div>

            <Button type="button" onClick={vm.guardarHistorial} disabled={vm.saveLoading || !vm.canEdit}>
              {vm.saveLoading ? "Guardando..." : "Guardar historial clínico"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
