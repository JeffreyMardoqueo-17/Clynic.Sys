"use client"

import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, ClipboardCheck, FileHeart, Stethoscope, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function DoctorConsultaDetallePage() {
  const params = useParams<{ id: string }>()
  const vm = useAppointmentPage()

  const idCita = Number(params?.id)

  const citaActual = useMemo(
    () => vm.citas.find((cita) => cita.id === idCita) ?? null,
    [vm.citas, idCita]
  )

  useEffect(() => {
    if (!vm.loading && Number.isFinite(idCita) && idCita > 0) {
      void vm.abrirCitaDoctor(idCita)
    }
  }, [vm.loading, vm.abrirCitaDoctor, idCita])

  if (vm.loading) {
    return <p className="text-sm text-muted-foreground">Cargando expediente clínico...</p>
  }

  if (vm.role !== "Doctor") {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle>Acceso solo para doctor</CardTitle>
          <CardDescription>Esta vista clínica detallada está disponible únicamente para el rol Doctor.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!idCita || !citaActual || citaActual.idDoctor !== vm.idUsuario) {
    return (
      <div className="space-y-4">
        <Link href="/appointment">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" /> Volver a consultas
          </Button>
        </Link>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle>No se encontró la cita</CardTitle>
            <CardDescription>
              Esta cita no existe o no está asignada al doctor actual.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary">Expediente de consulta</h1>
          <p className="text-sm text-muted-foreground">
            Caso #{citaActual.id} · {citaActual.nombrePaciente}
          </p>
        </div>
        <Link href="/appointment">
            <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" /> Volver al tablero
          </Button>
        </Link>
      </div>

      {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" /> Datos del paciente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            <p><span className="font-semibold">Nombre:</span> {citaActual.nombrePaciente}</p>
            <p><span className="font-semibold">Correo:</span> {citaActual.correoPaciente || "N/A"}</p>
            <p><span className="font-semibold">Teléfono:</span> {citaActual.telefonoPaciente || "N/A"}</p>
            <p><span className="font-semibold">Estado:</span> <Badge className="ml-2">{estadoLabel(citaActual.estado)}</Badge></p>
            <p><span className="font-semibold">Inicio:</span> {new Date(citaActual.fechaHoraInicioPlan).toLocaleString()}</p>
            <p><span className="font-semibold">Servicios:</span> {citaActual.servicios.map((servicio) => servicio.nombreServicio).join(", ") || "Sin servicios"}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardCheck className="size-5" /> Estado clínico</CardTitle>
            <CardDescription>Consulta activa y lista para documentación médica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-semibold">ID cita:</span> #{citaActual.id}</p>
            <p><span className="font-semibold">Doctor:</span> Tú</p>
            <p><span className="font-semibold">Sucursal:</span> {vm.sucursales.find((s) => s.id === citaActual.idSucursal)?.nombre ?? `Sucursal ${citaActual.idSucursal}`}</p>
            <Badge variant="secondary">Expediente abierto</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileHeart className="size-5 text-primary" /> Historial clínico</CardTitle>
            <CardDescription>
              {vm.historialActual?.fechaActualizacion
                ? `Última actualización: ${new Date(vm.historialActual.fechaActualizacion).toLocaleString()}`
                : "Sin historial previo: completa y guarda el expediente del paciente."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {vm.historialLoading ? (
              <p className="text-sm text-muted-foreground">Cargando historial...</p>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enfermedades previas</label>
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.enfermedadesPrevias}
                    onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, enfermedadesPrevias: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medicamentos actuales</label>
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.medicamentosActuales}
                    onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, medicamentosActuales: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alergias</label>
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.alergias}
                    onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, alergias: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Antecedentes familiares</label>
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.antecedentesFamiliares}
                    onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, antecedentesFamiliares: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observaciones</label>
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    value={vm.formHistorial.observaciones}
                    onChange={(e) => vm.setFormHistorial((prev) => ({ ...prev, observaciones: e.target.value }))}
                  />
                </div>

                <Button type="button" onClick={vm.guardarHistorialPaciente} disabled={vm.historialSaving} className="w-full">
                  {vm.historialSaving ? "Guardando historial..." : "Guardar historial clínico"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Stethoscope className="size-5 text-primary" /> Consulta médica</CardTitle>
            <CardDescription>Registra diagnóstico, indicaciones y finaliza esta cita.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Diagnóstico *</label>
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
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

            <Button
              type="button"
              className="w-full"
              onClick={async () => {
                vm.setIdCitaConsulta(citaActual.id)
                await vm.registrarConsultaPorCita(citaActual.id)
              }}
              disabled={vm.consultaLoading}
            >
              {vm.consultaLoading ? "Guardando consulta..." : "Guardar consulta y enviar a recepción"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
