"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { usePatientsPage } from "@/app/(protected)/patients/hooks/use-patients-page"

export function PatientsManagement() {
  const vm = usePatientsPage()

  if (vm.loading) {
    return <p className="text-sm text-muted-foreground">Cargando pacientes...</p>
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Pacientes</h1>
        <p className="text-sm text-muted-foreground">
          Gestión de pacientes y actualización de registro clínico por rol.
        </p>
      </header>

      {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Búsqueda</CardTitle>
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
          <CardTitle>Listado de pacientes</CardTitle>
          <CardDescription>{vm.pacientes.length} registro(s)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Nombre</th>
                <th className="p-2">Correo</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Fecha registro</th>
                <th className="p-2">Consultas</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {vm.pacientes.map((paciente) => (
                <tr key={paciente.id} className="border-b">
                  <td className="p-2">{paciente.nombreCompleto}</td>
                  <td className="p-2">{paciente.correo}</td>
                  <td className="p-2">{paciente.telefono || "N/A"}</td>
                  <td className="p-2">{new Date(paciente.fechaRegistro).toLocaleDateString()}</td>
                  <td className="p-2">{paciente.consultasRecientes?.length ?? 0}</td>
                  <td className="p-2">
                    <Button size="sm" variant="outline" onClick={() => vm.openEdit(paciente)}>
                      Editar registro
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
            <CardTitle>Editar paciente: {vm.selectedPaciente.nombreCompleto}</CardTitle>
            <CardDescription>
              Recepción actualiza datos personales. Historial clínico solo Doctor/Admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombres</label>
                <Input
                  value={vm.formPaciente.nombres}
                  onChange={(e) => vm.setFormPaciente((prev) => ({ ...prev, nombres: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Apellidos</label>
                <Input
                  value={vm.formPaciente.apellidos}
                  onChange={(e) => vm.setFormPaciente((prev) => ({ ...prev, apellidos: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Correo</label>
                <Input
                  type="email"
                  value={vm.formPaciente.correo}
                  onChange={(e) => vm.setFormPaciente((prev) => ({ ...prev, correo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={vm.formPaciente.telefono}
                  onChange={(e) => vm.setFormPaciente((prev) => ({ ...prev, telefono: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha nacimiento</label>
                <Input
                  type="date"
                  value={vm.formPaciente.fechaNacimiento}
                  onChange={(e) => vm.setFormPaciente((prev) => ({ ...prev, fechaNacimiento: e.target.value }))}
                />
              </div>
            </div>

            {vm.canEditHistorial && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enfermedades previas</label>
                  <textarea
                    className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.enfermedadesPrevias}
                    onChange={(e) =>
                      vm.setFormHistorial((prev) => ({ ...prev, enfermedadesPrevias: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medicamentos actuales</label>
                  <textarea
                    className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.medicamentosActuales}
                    onChange={(e) =>
                      vm.setFormHistorial((prev) => ({ ...prev, medicamentosActuales: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alergias</label>
                  <textarea
                    className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.alergias}
                    onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, alergias: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Antecedentes familiares</label>
                  <textarea
                    className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.antecedentesFamiliares}
                    onChange={(e) =>
                      vm.setFormHistorial((prev) => ({ ...prev, antecedentesFamiliares: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Observaciones</label>
                  <textarea
                    className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.observaciones}
                    onChange={(e) =>
                      vm.setFormHistorial((prev) => ({ ...prev, observaciones: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" onClick={vm.savePaciente} disabled={vm.saveLoading}>
                {vm.saveLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button type="button" variant="outline" onClick={vm.closeEdit}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
