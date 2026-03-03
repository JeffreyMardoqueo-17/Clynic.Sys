"use client"

import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { BellRing, ClipboardPlus, FileHeart, Stethoscope, UserRound, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CitaResponseDto } from "@/types/cita"
import { SucursalResponseDto } from "@/types/sucursal"
import { HistorialClinicoResponseDto } from "@/types/historial-clinico"

type DoctorConsultationWorkbenchProps = {
  idUsuario: number
  citas: CitaResponseDto[]
  sucursales: SucursalResponseDto[]
  estadoLoadingId: number | null
  consultaLoading: boolean
  historialActual: HistorialClinicoResponseDto | null
  historialLoading: boolean
  historialSaving: boolean
  formHistorial: {
    enfermedadesPrevias: string
    medicamentosActuales: string
    alergias: string
    antecedentesFamiliares: string
    observaciones: string
  }
  setFormHistorial: Dispatch<SetStateAction<{
    enfermedadesPrevias: string
    medicamentosActuales: string
    alergias: string
    antecedentesFamiliares: string
    observaciones: string
  }>>
  citasDoctorEnConsulta: CitaResponseDto[]
  siguienteCitaDoctor: CitaResponseDto | null
  citaDoctorActiva: CitaResponseDto | null
  abrirCitaDoctor: (idCita: number) => Promise<void>
  pasarAConsulta: (idCita: number) => Promise<void>
  setIdCitaConsulta: (idCita: number) => void
  diagnostico: string
  setDiagnostico: (value: string) => void
  tratamiento: string
  setTratamiento: (value: string) => void
  receta: string
  setReceta: (value: string) => void
  examenes: string
  setExamenes: (value: string) => void
  notasMedicas: string
  setNotasMedicas: (value: string) => void
  registrarConsultaPorCita: (idCita: number) => Promise<void>
  guardarHistorialPaciente: () => Promise<void>
  agendarSeguimiento: (idCitaBase: number, fechaHoraSeguimiento: string) => Promise<void>
}

export function DoctorConsultationWorkbench({
  idUsuario,
  citas,
  sucursales,
  estadoLoadingId,
  consultaLoading,
  historialActual,
  historialLoading,
  historialSaving,
  formHistorial,
  setFormHistorial,
  citasDoctorEnConsulta,
  siguienteCitaDoctor,
  citaDoctorActiva,
  abrirCitaDoctor,
  pasarAConsulta,
  setIdCitaConsulta,
  diagnostico,
  setDiagnostico,
  tratamiento,
  setTratamiento,
  receta,
  setReceta,
  examenes,
  setExamenes,
  notasMedicas,
  setNotasMedicas,
  registrarConsultaPorCita,
  guardarHistorialPaciente,
  agendarSeguimiento,
}: DoctorConsultationWorkbenchProps) {
  const [fechaSeguimiento, setFechaSeguimiento] = useState("")

  const citasPorRecibir = useMemo(
    () => [...citas]
      .filter((cita) => cita.idDoctor === idUsuario && (cita.estado === 2 || cita.estado === 5) && !cita.consultaMedica)
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime()),
    [citas, idUsuario]
  )

  const sucursalActiva = citaDoctorActiva
    ? sucursales.find((s) => s.id === citaDoctorActiva.idSucursal)?.nombre ?? `Sucursal ${citaDoctorActiva.idSucursal}`
    : ""

  return (
    <div className="space-y-5">
      <Card className="border-primary/35 bg-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BellRing className="size-5 animate-pulse" />
            Siguiente cita para atender
          </CardTitle>
          <CardDescription>Cuando recepción pasa una cita, aparece aquí automáticamente.</CardDescription>
        </CardHeader>
        <CardContent>
          {siguienteCitaDoctor ? (
            <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-background/80 p-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-base font-semibold">#{siguienteCitaDoctor.id} · {siguienteCitaDoctor.nombrePaciente}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(siguienteCitaDoctor.fechaHoraInicioPlan).toLocaleString()} · {sucursales.find((s) => s.id === siguienteCitaDoctor.idSucursal)?.nombre ?? `Sucursal ${siguienteCitaDoctor.idSucursal}`}
                </p>
                <Badge className="mt-1">En consulta</Badge>
              </div>
              <Button
                type="button"
                className="gap-2"
                onClick={() => abrirCitaDoctor(siguienteCitaDoctor.id)}
              >
                <Sparkles className="size-4" /> Abrir caso
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay nuevas citas transferidas por recepción en este momento.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="border-secondary/35 bg-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Stethoscope className="size-5" /> Cola de consulta</CardTitle>
            <CardDescription>{citasDoctorEnConsulta.length} cita(s) lista(s) para atención</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {citasDoctorEnConsulta.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes pacientes en consulta.</p>
            ) : (
              citasDoctorEnConsulta.map((cita) => (
                <button
                  key={cita.id}
                  type="button"
                  className="w-full rounded-md border border-secondary/40 bg-background/80 p-3 text-left transition hover:bg-background"
                  onClick={() => abrirCitaDoctor(cita.id)}
                >
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <p className="text-xs text-muted-foreground">{new Date(cita.fechaHoraInicioPlan).toLocaleString()}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-chart-4/40 bg-chart-4/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardPlus className="size-5" /> Pendientes de recibir</CardTitle>
            <CardDescription>Citas confirmadas/presentes asignadas a ti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {citasPorRecibir.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin pendientes por recibir.</p>
            ) : (
              citasPorRecibir.map((cita) => (
                <div key={cita.id} className="rounded-md border border-chart-4/50 bg-background/80 p-3">
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <p className="text-xs text-muted-foreground">{new Date(cita.fechaHoraInicioPlan).toLocaleString()}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={async () => {
                      await pasarAConsulta(cita.id)
                      await abrirCitaDoctor(cita.id)
                    }}
                    disabled={estadoLoadingId === cita.id}
                  >
                    {estadoLoadingId === cita.id ? "Actualizando..." : "Pasar a consulta"}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-chart-2/40 bg-chart-2/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="size-5" /> Caso activo</CardTitle>
            <CardDescription>Paciente abierto para revisión clínica</CardDescription>
          </CardHeader>
          <CardContent>
            {citaDoctorActiva ? (
              <div className="space-y-2 rounded-md border border-chart-2/40 bg-background/80 p-3 text-sm">
                <p><span className="font-medium">Paciente:</span> {citaDoctorActiva.nombrePaciente}</p>
                <p><span className="font-medium">Correo:</span> {citaDoctorActiva.correoPaciente || "N/A"}</p>
                <p><span className="font-medium">Teléfono:</span> {citaDoctorActiva.telefonoPaciente || "N/A"}</p>
                <p><span className="font-medium">Sucursal:</span> {sucursalActiva}</p>
                <p><span className="font-medium">Servicios:</span> {citaDoctorActiva.servicios.map((s) => s.nombreServicio).join(", ") || "Sin servicios"}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Abre una cita para ver su expediente clínico.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {citaDoctorActiva && (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="border-chart-3/40 bg-chart-3/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileHeart className="size-5" /> Historial clínico</CardTitle>
              <CardDescription>
                {historialActual?.fechaActualizacion
                  ? `Última actualización: ${new Date(historialActual.fechaActualizacion).toLocaleString()}`
                  : "Sin historial previo: puedes crear uno ahora."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {historialLoading ? (
                <p className="text-sm text-muted-foreground">Cargando historial...</p>
              ) : (
                <>
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Enfermedades previas"
                    value={formHistorial.enfermedadesPrevias}
                    onChange={(e) => setFormHistorial((prev) => ({ ...prev, enfermedadesPrevias: e.target.value }))}
                  />
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Medicamentos actuales"
                    value={formHistorial.medicamentosActuales}
                    onChange={(e) => setFormHistorial((prev) => ({ ...prev, medicamentosActuales: e.target.value }))}
                  />
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Alergias"
                    value={formHistorial.alergias}
                    onChange={(e) => setFormHistorial((prev) => ({ ...prev, alergias: e.target.value }))}
                  />
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Antecedentes familiares"
                    value={formHistorial.antecedentesFamiliares}
                    onChange={(e) => setFormHistorial((prev) => ({ ...prev, antecedentesFamiliares: e.target.value }))}
                  />
                  <textarea
                    className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Observaciones"
                    value={formHistorial.observaciones}
                    onChange={(e) => setFormHistorial((prev) => ({ ...prev, observaciones: e.target.value }))}
                  />

                  <Button type="button" onClick={guardarHistorialPaciente} disabled={historialSaving}>
                    {historialSaving ? "Guardando historial..." : "Guardar historial clínico"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/35 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Stethoscope className="size-5" /> Consulta médica</CardTitle>
              <CardDescription>
                Completa la consulta, cierra el caso y define si requiere seguimiento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Diagnóstico"
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
              />
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Tratamiento"
                value={tratamiento}
                onChange={(e) => setTratamiento(e.target.value)}
              />
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Receta"
                value={receta}
                onChange={(e) => setReceta(e.target.value)}
              />
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Exámenes solicitados"
                value={examenes}
                onChange={(e) => setExamenes(e.target.value)}
              />
              <textarea
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Notas médicas"
                value={notasMedicas}
                onChange={(e) => setNotasMedicas(e.target.value)}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    setIdCitaConsulta(citaDoctorActiva.id)
                    await registrarConsultaPorCita(citaDoctorActiva.id)
                  }}
                  disabled={consultaLoading}
                >
                  {consultaLoading ? "Guardando consulta..." : "Finalizar consulta"}
                </Button>
              </div>

              {citaDoctorActiva.estado === 4 && (
                <div className="grid gap-2 rounded-md border border-primary/25 bg-background/70 p-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="datetime-local"
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                    value={fechaSeguimiento}
                    onChange={(e) => setFechaSeguimiento(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={() => agendarSeguimiento(citaDoctorActiva.id, fechaSeguimiento)}
                  >
                    Agendar seguimiento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
