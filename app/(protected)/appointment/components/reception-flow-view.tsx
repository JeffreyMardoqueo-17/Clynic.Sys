"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, ClipboardCheck, Stethoscope } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CitaResponseDto } from "@/types/cita"
import { SucursalResponseDto } from "@/types/sucursal"

type ReceptionFlowViewProps = {
  role: "Admin" | "Doctor" | "Recepcionista" | "Unknown"
  citas: CitaResponseDto[]
  sucursales: SucursalResponseDto[]
  estadoLoadingId: number | null
  consultaLoading: boolean
  canCreateInternal: boolean
  marcarPresente: (idCita: number) => Promise<void>
  pasarAConsulta: (idCita: number) => Promise<void>
  setIdCitaConsulta: (idCita: number) => void
  agendarSeguimiento: (idCitaBase: number, fechaHoraSeguimiento: string) => Promise<void>
  abrirConsultaEnVistaTabla: (idCita: number) => void
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

function estadoLabel(estado: number) {
  if (estado === 1) return "Pendiente"
  if (estado === 2) return "Confirmada"
  if (estado === 3) return "Cancelada"
  if (estado === 4) return "Completada"
  if (estado === 5) return "Presente"
  if (estado === 6) return "En consulta"
  return "N/A"
}

function ordenarPorInicioAsc(citas: CitaResponseDto[]) {
  return [...citas].sort(
    (a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime()
  )
}

export function ReceptionFlowView({
  role,
  citas,
  sucursales,
  estadoLoadingId,
  consultaLoading,
  canCreateInternal,
  marcarPresente,
  pasarAConsulta,
  setIdCitaConsulta,
  agendarSeguimiento,
  abrirConsultaEnVistaTabla,
}: ReceptionFlowViewProps) {
  const roleLower = String(role ?? "").toLowerCase()
  const isReceptionOrAdmin = roleLower === "admin" || roleLower === "recepcionista"
  const isAdminOrDoctor = roleLower === "admin" || roleLower === "doctor"
  const [fechaSeguimientoPorCita, setFechaSeguimientoPorCita] = useState<Record<number, string>>({})
  const [citaActiva, setCitaActiva] = useState<CitaResponseDto | null>(null)

  const colaRecepcion = useMemo(
    () => ordenarPorInicioAsc(citas.filter((cita) => cita.estado === 1 || cita.estado === 2 || cita.estado === 5)),
    [citas]
  )

  const colaConsulta = useMemo(
    () => ordenarPorInicioAsc(citas.filter((cita) => cita.estado === 6)),
    [citas]
  )

  const colaFinalizadas = useMemo(
    () => ordenarPorInicioAsc(citas.filter((cita) => cita.estado === 4)),
    [citas]
  )

  const sucursalActual = citaActiva
    ? sucursales.find((sucursal) => sucursal.id === citaActiva.idSucursal)?.nombre ?? `Sucursal ${citaActiva.idSucursal}`
    : ""

  const cerrarDialogo = () => setCitaActiva(null)

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2"><ClipboardCheck className="size-5 text-primary" /> Recepción</span>
              <Badge variant="secondary">{colaRecepcion.length}</Badge>
            </CardTitle>
            <CardDescription>Llegada del paciente y pase a consulta (ordenado por fecha/hora)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {colaRecepcion.length === 0 && <p className="text-sm text-muted-foreground">Sin pacientes en recepción.</p>}

            {colaRecepcion.map((cita) => (
              <button
                key={cita.id}
                type="button"
                className="w-full space-y-2 rounded-lg border border-primary/25 bg-background/80 p-3 text-left shadow-sm transition hover:bg-background"
                onClick={() => setCitaActiva(cita)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <Badge variant={estadoBadgeVariant(cita.estado)} className="font-semibold">{estadoLabel(cita.estado)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(cita.fechaHoraInicioPlan).toLocaleString()} · {sucursales.find((s) => s.id === cita.idSucursal)?.nombre ?? `Sucursal ${cita.idSucursal}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {isReceptionOrAdmin && (cita.estado === 1 || cita.estado === 2) && (
                    <Badge variant="outline">Click para marcar llegada</Badge>
                  )}
                  {isReceptionOrAdmin && cita.estado === 5 && (
                    <Badge variant="secondary">Click para pasar a doctor</Badge>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-secondary/30 bg-secondary/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2"><Stethoscope className="size-5 text-secondary-foreground" /> Consulta Médica</span>
              <Badge variant="ghost">{colaConsulta.length}</Badge>
            </CardTitle>
            <CardDescription>Pacientes en atención por doctor (ordenado por fecha/hora)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {colaConsulta.length === 0 && <p className="text-sm text-muted-foreground">Sin pacientes en consulta.</p>}

            {colaConsulta.map((cita) => (
              <button
                key={cita.id}
                type="button"
                className="w-full space-y-2 rounded-lg border border-secondary/30 bg-background/80 p-3 text-left shadow-sm transition hover:bg-background"
                onClick={() => setCitaActiva(cita)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <Badge variant={estadoBadgeVariant(cita.estado)} className="font-semibold">{estadoLabel(cita.estado)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Doctor: {cita.idDoctor ? `#${cita.idDoctor}` : "Sin asignar"}</p>
                {isAdminOrDoctor && <Badge variant="secondary">Click para abrir cierre de consulta</Badge>}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-chart-3/30 bg-chart-3/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-5 text-chart-3" /> Cierre y Seguimiento</span>
              <Badge>{colaFinalizadas.length}</Badge>
            </CardTitle>
            <CardDescription>Fin de atención y reagendamiento desde recepción (ordenado por fecha/hora)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {colaFinalizadas.length === 0 && <p className="text-sm text-muted-foreground">Sin citas finalizadas.</p>}

            {colaFinalizadas.map((cita) => (
              <button
                key={cita.id}
                type="button"
                className="w-full space-y-2 rounded-lg border border-chart-3/35 bg-background/85 p-3 text-left shadow-sm transition hover:bg-background"
                onClick={() => setCitaActiva(cita)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <Badge variant={estadoBadgeVariant(cita.estado)} className="font-semibold">{estadoLabel(cita.estado)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Diagnóstico: {cita.consultaMedica?.diagnostico || "Sin diagnóstico"}</p>

                {canCreateInternal && (
                  <div className="grid gap-2 md:grid-cols-[1fr_auto]" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="datetime-local"
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm ring-1 ring-chart-3/20"
                      value={fechaSeguimientoPorCita[cita.id] ?? ""}
                      onChange={(e) =>
                        setFechaSeguimientoPorCita((prev) => ({
                          ...prev,
                          [cita.id]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-chart-3/80 text-foreground hover:bg-chart-3"
                      onClick={() => agendarSeguimiento(cita.id, fechaSeguimientoPorCita[cita.id] ?? "")}
                    >
                      Agendar seguimiento
                    </Button>
                  </div>
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!citaActiva} onOpenChange={(open) => { if (!open) cerrarDialogo() }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {citaActiva ? `Cita #${citaActiva.id} · ${citaActiva.nombrePaciente}` : "Detalle de cita"}
            </DialogTitle>
            <DialogDescription>
              Revisa datos de paciente y cita, y ejecuta la transición al siguiente estado.
            </DialogDescription>
          </DialogHeader>

          {citaActiva && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="font-semibold">Paciente</p>
                  <p>Nombre: {citaActiva.nombrePaciente}</p>
                  <p>Correo: {citaActiva.correoPaciente || "N/A"}</p>
                  <p>Teléfono: {citaActiva.telefonoPaciente || "N/A"}</p>
                </div>

                <div className="rounded-md border p-3">
                  <p className="font-semibold">Cita</p>
                  <p>Estado: <Badge variant={estadoBadgeVariant(citaActiva.estado)}>{estadoLabel(citaActiva.estado)}</Badge></p>
                  <p>Inicio: {new Date(citaActiva.fechaHoraInicioPlan).toLocaleString()}</p>
                  <p>Fin: {new Date(citaActiva.fechaHoraFinPlan).toLocaleString()}</p>
                  <p>Sucursal: {sucursalActual}</p>
                </div>
              </div>

              <div className="rounded-md border p-3">
                <p className="font-semibold">Servicios</p>
                <p>{citaActiva.servicios.map((servicio) => servicio.nombreServicio).join(", ") || "Sin servicios"}</p>
              </div>

              <div className="rounded-md border p-3">
                <p className="font-semibold">Caso / Comentarios</p>
                <p>{citaActiva.notas || "Sin comentarios de recepción."}</p>
                {citaActiva.consultaMedica?.notasMedicas && (
                  <p className="mt-2"><span className="font-semibold">Notas médicas:</span> {citaActiva.consultaMedica.notasMedicas}</p>
                )}
              </div>
            </div>
          )}

          {citaActiva && (
            <DialogFooter className="flex-wrap gap-2 sm:justify-start">
              {isReceptionOrAdmin && (citaActiva.estado === 1 || citaActiva.estado === 2) && (
                <Button
                  type="button"
                  onClick={async () => {
                    await marcarPresente(citaActiva.id)
                    cerrarDialogo()
                  }}
                  disabled={estadoLoadingId === citaActiva.id}
                >
                  {estadoLoadingId === citaActiva.id ? "Actualizando..." : "Paciente llegó (Presente)"}
                </Button>
              )}

              {isReceptionOrAdmin && citaActiva.estado === 5 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    await pasarAConsulta(citaActiva.id)
                    cerrarDialogo()
                  }}
                  disabled={estadoLoadingId === citaActiva.id}
                >
                  {estadoLoadingId === citaActiva.id ? "Actualizando..." : "Pasar a Doctor (En consulta)"}
                </Button>
              )}

              {isAdminOrDoctor && citaActiva.estado === 6 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIdCitaConsulta(citaActiva.id)
                    abrirConsultaEnVistaTabla(citaActiva.id)
                    cerrarDialogo()
                  }}
                >
                  Abrir formulario de consulta
                </Button>
              )}

              <Button type="button" variant="ghost" onClick={cerrarDialogo}>Cerrar</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
