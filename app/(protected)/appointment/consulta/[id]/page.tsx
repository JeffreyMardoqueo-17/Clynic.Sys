"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  FileHeart,
  FilePenLine,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAppointmentPage } from "@/app/(protected)/appointment/hooks/use-appointment-page"
import { useToast } from "@/hooks/use-toast"

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
  const router = useRouter()
  const { showToast } = useToast()
  const vm = useAppointmentPage()
  const [openHistorial, setOpenHistorial] = useState(false)
  const [openConsulta, setOpenConsulta] = useState(false)
  const openedCitaRef = useRef<number | null>(null)

  const idCita = Number(params?.id)

  const citaActual = useMemo(
    () => vm.citas.find((cita) => cita.id === idCita) ?? null,
    [vm.citas, idCita]
  )

  useEffect(() => {
    if (!vm.loading && Number.isFinite(idCita) && idCita > 0 && openedCitaRef.current !== idCita) {
      openedCitaRef.current = idCita
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

  const finalizarConsulta = async () => {
    if (!citaActual.consultaMedica) {
      showToast("Primero guarda la consulta antes de finalizar", "warning")
      setOpenConsulta(true)
      return
    }

    showToast(`Consulta #${citaActual.id} finalizada`, "success")
    router.push("/doctor-panel")
    router.refresh()
  }

  const guardarConsulta = async () => {
    vm.setIdCitaConsulta(citaActual.id)
    await vm.registrarConsultaPorCita(citaActual.id)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Badge className="bg-primary/15 text-primary hover:bg-primary/20">Consulta en curso</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Expediente de consulta</h1>
          <p className="text-sm text-muted-foreground">Caso #{citaActual.id} · {citaActual.nombrePaciente}</p>
        </div>
        <Link href="/appointment">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" /> Volver al tablero
          </Button>
        </Link>
      </div>

      {vm.error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{vm.error}</div>}

      <Card className="overflow-hidden border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-transparent shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="size-4" /> Flujo clínico guiado
            </p>
            <p className="text-sm text-muted-foreground">
              Abre solo el formulario que necesites para mantener foco durante la consulta.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="gap-2 border-primary/30 text-primary" onClick={() => setOpenHistorial(true)}>
              <FileHeart className="size-4" /> Editar historial
            </Button>
            <Button type="button" className="gap-2" onClick={() => setOpenConsulta(true)}>
              <Stethoscope className="size-4" /> Registrar consulta
            </Button>
            <Button
              type="button"
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={finalizarConsulta}
              disabled={vm.consultaLoading}
            >
              <ClipboardCheck className="size-4" /> {vm.consultaLoading ? "Finalizando..." : "Finalizar consulta"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="border-primary/20 shadow-sm xl:col-span-2">
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

        <Card className="border-primary/20 bg-primary/5 shadow-sm">
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

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-sky-500/30 bg-sky-500/10 shadow-sm">
          <CardContent className="space-y-2 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-sky-700 dark:text-sky-300">
              <HeartPulse className="size-4" /> Historial clínico
            </p>
            <p className="text-sm text-muted-foreground">
              {vm.historialActual?.fechaActualizacion
                ? `Actualizado: ${new Date(vm.historialActual.fechaActualizacion).toLocaleString()}`
                : "Paciente sin historial previo registrado."}
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-sky-500/40 text-sky-700 hover:bg-sky-500/15 dark:text-sky-300"
              onClick={() => setOpenHistorial(true)}
            >
              <FilePenLine className="size-4" /> Abrir historial
            </Button>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/10 shadow-sm">
          <CardContent className="space-y-2 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <Stethoscope className="size-4" /> Nota de consulta
            </p>
            <p className="text-sm text-muted-foreground">
              Registra diagnóstico, plan y egreso clínico en un solo paso.
            </p>
            <Button type="button" className="w-full gap-2" onClick={() => setOpenConsulta(true)}>
              <ClipboardCheck className="size-4" /> Abrir formulario
            </Button>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/10 shadow-sm">
          <CardContent className="space-y-2 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
              <CalendarClock className="size-4" /> Estado operativo
            </p>
            <p className="text-sm text-muted-foreground">
              Esta cita se encuentra en estado <strong>{estadoLabel(citaActual.estado)}</strong>.
            </p>
            <Badge variant="secondary" className="w-fit">Caso activo #{citaActual.id}</Badge>
            {citaActual.consultaMedica ? (
              <Badge className="w-fit bg-emerald-600 text-white">Consulta guardada, lista para finalizar</Badge>
            ) : (
              <Badge variant="outline" className="w-fit">Consulta pendiente de guardado</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={openHistorial} onOpenChange={setOpenHistorial}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileHeart className="size-5 text-primary" /> Historial clínico</DialogTitle>
            <DialogDescription>
              {vm.historialActual?.fechaActualizacion
                ? `Última actualización: ${new Date(vm.historialActual.fechaActualizacion).toLocaleString()}`
                : "Sin historial previo: completa y guarda el expediente del paciente."}
            </DialogDescription>
          </DialogHeader>

          {vm.historialLoading ? (
            <p className="text-sm text-muted-foreground">Cargando historial...</p>
          ) : (
            <div className="space-y-3">
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
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setOpenHistorial(false)}>
              Cerrar
            </Button>
            <Button type="button" onClick={vm.guardarHistorialPaciente} disabled={vm.historialSaving || vm.historialLoading}>
              {vm.historialSaving ? "Guardando historial..." : "Guardar historial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openConsulta} onOpenChange={setOpenConsulta}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Stethoscope className="size-5 text-primary" /> Consulta médica</DialogTitle>
            <DialogDescription>Registra diagnóstico, indicaciones y finaliza esta cita.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
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
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setOpenConsulta(false)}>
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={guardarConsulta}
              disabled={vm.consultaLoading}
            >
              {vm.consultaLoading ? "Guardando consulta..." : "Guardar consulta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
