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
import { UsuarioResponseDto } from "@/types/usuario"

type ReceptionFlowViewProps = {
  role: "Admin" | "Doctor" | "Nutricionista" | "Fisioterapeuta" | "Recepcionista" | "Unknown"
  citas: CitaResponseDto[]
  sucursales: SucursalResponseDto[]
  doctores: UsuarioResponseDto[]
  estadoLoadingId: number | null
  consultaLoading: boolean
  canCreateInternal: boolean
  marcarPresente: (idCita: number) => Promise<void>
  pasarAConsulta: (idCita: number, idDoctorAsignado?: number) => Promise<void>
  cerrarProcesoRecepcion: (idCita: number) => Promise<void>
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
  doctores,
  estadoLoadingId,
  consultaLoading,
  canCreateInternal,
  marcarPresente,
  pasarAConsulta,
  cerrarProcesoRecepcion,
  setIdCitaConsulta,
  agendarSeguimiento,
  abrirConsultaEnVistaTabla,
}: ReceptionFlowViewProps) {
  const roleLower = String(role ?? "").toLowerCase()
  const isReceptionOrAdmin = roleLower === "admin" || roleLower === "recepcionista"
  const isAdminOrDoctor = roleLower === "admin" || roleLower === "doctor"
  const [fechaSeguimientoPorCita, setFechaSeguimientoPorCita] = useState<Record<number, string>>({})
  const [doctorSeleccionadoPorCita, setDoctorSeleccionadoPorCita] = useState<Record<number, number>>({})
  const [vistaCierre, setVistaCierre] = useState<"pendientes" | "hoy" | "historial">("pendientes")
  const [citaActiva, setCitaActiva] = useState<CitaResponseDto | null>(null)

  const doctorLabelPorId = useMemo(
    () => Object.fromEntries(doctores.map((doctor) => [doctor.id, doctor.nombreCompleto])),
    [doctores]
  )

  const colaRecepcion = useMemo(
    () => ordenarPorInicioAsc(citas.filter((cita) => cita.estado === 1 || cita.estado === 2 || cita.estado === 5)),
    [citas]
  )

  const colaConsulta = useMemo(
    () => ordenarPorInicioAsc(citas.filter((cita) => cita.estado === 6 && !cita.consultaMedica)),
    [citas]
  )

  const pendientesCierre = useMemo(
    () => ordenarPorInicioAsc(citas.filter((cita) => cita.estado === 6 && !!cita.consultaMedica)),
    [citas]
  )

  const consultasFinalizadasHoy = useMemo(() => {
    const ahora = new Date()
    const anio = ahora.getFullYear()
    const mes = ahora.getMonth()
    const dia = ahora.getDate()

    const esMismoDia = (fecha: Date) =>
      fecha.getFullYear() === anio && fecha.getMonth() === mes && fecha.getDate() === dia

    return [...citas]
      .filter((cita) => cita.estado === 4 && !!cita.consultaMedica)
      .filter((cita) => {
        const fechaRef = cita.fechaHoraFinReal
          ? new Date(cita.fechaHoraFinReal)
          : cita.consultaMedica?.fechaConsulta
            ? new Date(cita.consultaMedica.fechaConsulta)
            : new Date(cita.fechaHoraInicioPlan)

        return esMismoDia(fechaRef)
      })
      .sort((a, b) => {
        const fechaA = a.fechaHoraFinReal
          ? new Date(a.fechaHoraFinReal).getTime()
          : a.consultaMedica?.fechaConsulta
            ? new Date(a.consultaMedica.fechaConsulta).getTime()
            : new Date(a.fechaHoraInicioPlan).getTime()
        const fechaB = b.fechaHoraFinReal
          ? new Date(b.fechaHoraFinReal).getTime()
          : b.consultaMedica?.fechaConsulta
            ? new Date(b.consultaMedica.fechaConsulta).getTime()
            : new Date(b.fechaHoraInicioPlan).getTime()
        return fechaB - fechaA
      })
  }, [citas])

  const historialConsultas = useMemo(
    () => [...citas]
      .filter((cita) => !!cita.consultaMedica)
      .sort((a, b) => {
        const fechaA = a.consultaMedica?.fechaConsulta
          ? new Date(a.consultaMedica.fechaConsulta).getTime()
          : new Date(a.fechaHoraInicioPlan).getTime()
        const fechaB = b.consultaMedica?.fechaConsulta
          ? new Date(b.consultaMedica.fechaConsulta).getTime()
          : new Date(b.fechaHoraInicioPlan).getTime()
        return fechaB - fechaA
      }),
    [citas]
  )

  const sucursalActual = citaActiva
    ? sucursales.find((sucursal) => sucursal.id === citaActiva.idSucursal)?.nombre ?? `Sucursal ${citaActiva.idSucursal}`
    : ""

  const cerrarDialogo = () => setCitaActiva(null)

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-sm">
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
                className="w-full space-y-2 rounded-lg border border-orange-200 bg-orange-50/70 p-3 text-left shadow-sm transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                onClick={() => setCitaActiva(cita)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <Badge variant={estadoBadgeVariant(cita.estado)} className="font-semibold">{estadoLabel(cita.estado)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(cita.fechaHoraInicioPlan).toLocaleString()} · {sucursales.find((s) => s.id === cita.idSucursal)?.nombre ?? `Sucursal ${cita.idSucursal}`}
                </p>
                {(cita.estado === 5 || cita.estado === 6) && (
                  <p className="text-xs text-muted-foreground">
                    {cita.idDoctor
                      ? `Lo atenderá ${doctorLabelPorId[cita.idDoctor] ?? `Doctor #${cita.idDoctor}`}`
                      : "Doctor pendiente de asignación"}
                  </p>
                )}
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

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2"><Stethoscope className="size-5 text-primary" /> Consulta Médica</span>
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
                className="w-full space-y-2 rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-left shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-5 text-primary" /> Cierre y Seguimiento</span>
              <Badge>{vistaCierre === "pendientes" ? pendientesCierre.length : vistaCierre === "hoy" ? consultasFinalizadasHoy.length : historialConsultas.length}</Badge>
            </CardTitle>
            <CardDescription>Fin de atención y reagendamiento desde recepción (ordenado por fecha/hora)</CardDescription>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={vistaCierre === "pendientes" ? "default" : "outline"}
                onClick={() => setVistaCierre("pendientes")}
              >
                Pendientes de cierre
              </Button>
              <Button
                type="button"
                size="sm"
                variant={vistaCierre === "hoy" ? "default" : "outline"}
                onClick={() => setVistaCierre("hoy")}
              >
                Consultas finalizadas hoy
              </Button>
              <Button
                type="button"
                size="sm"
                variant={vistaCierre === "historial" ? "default" : "outline"}
                onClick={() => setVistaCierre("historial")}
              >
                Historial de consultas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {vistaCierre === "pendientes" && pendientesCierre.length === 0 && <p className="text-sm text-muted-foreground">No hay procesos pendientes de cierre.</p>}
            {vistaCierre === "hoy" && consultasFinalizadasHoy.length === 0 && <p className="text-sm text-muted-foreground">No hay consultas finalizadas hoy.</p>}
            {vistaCierre === "historial" && historialConsultas.length === 0 && <p className="text-sm text-muted-foreground">No hay historial de consultas.</p>}

            {vistaCierre === "pendientes" && pendientesCierre.map((cita) => (
              <div
                key={cita.id}
                role="button"
                tabIndex={0}
                className="w-full space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-left shadow-sm transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                onClick={() => setCitaActiva(cita)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setCitaActiva(cita)
                  }
                }}
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
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                      onClick={async () => {
                        await agendarSeguimiento(cita.id, fechaSeguimientoPorCita[cita.id] ?? "")
                        setFechaSeguimientoPorCita((prev) => ({ ...prev, [cita.id]: "" }))
                      }}
                    >
                      Agendar seguimiento y cerrar
                    </Button>

                    {isReceptionOrAdmin && cita.estado === 6 && cita.consultaMedica && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await cerrarProcesoRecepcion(cita.id)
                        }}
                      >
                        Cerrar proceso
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {vistaCierre === "hoy" && consultasFinalizadasHoy.map((cita) => (
              <button
                key={cita.id}
                type="button"
                className="w-full space-y-2 rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-left shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                onClick={() => setCitaActiva(cita)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <Badge>{estadoLabel(cita.estado)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cierre: {new Date(cita.fechaHoraFinReal ?? cita.consultaMedica?.fechaConsulta ?? cita.fechaHoraInicioPlan).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Doctor: {cita.idDoctor ? (doctorLabelPorId[cita.idDoctor] ?? `Doctor #${cita.idDoctor}`) : "Sin asignar"}
                </p>
              </button>
            ))}

            {vistaCierre === "historial" && historialConsultas.map((cita) => (
              <button
                key={cita.id}
                type="button"
                className="w-full space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-left shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                onClick={() => setCitaActiva(cita)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <Badge>{estadoLabel(cita.estado)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Consulta: {new Date(cita.consultaMedica?.fechaConsulta ?? cita.fechaHoraInicioPlan).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Diagnóstico: {cita.consultaMedica?.diagnostico || "Sin diagnóstico"}
                </p>
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

              {isReceptionOrAdmin && citaActiva.estado === 5 && (
                <div className="rounded-md border p-3">
                  <p className="font-semibold">Asignar doctor para consulta</p>
                  <select
                    className="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
                    value={doctorSeleccionadoPorCita[citaActiva.id] ?? citaActiva.idDoctor ?? ""}
                    onChange={(e) =>
                      setDoctorSeleccionadoPorCita((prev) => ({
                        ...prev,
                        [citaActiva.id]: Number(e.target.value),
                      }))
                    }
                  >
                    <option value="">Selecciona doctor</option>
                    {doctores.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.nombreCompleto}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {(() => {
                      const idDoctorAsignado = doctorSeleccionadoPorCita[citaActiva.id] ?? citaActiva.idDoctor
                      if (!idDoctorAsignado) {
                        return "Selecciona quién atenderá esta cita para poder transferirla."
                      }

                      return `Lo atenderá ${doctorLabelPorId[idDoctorAsignado] ?? `Doctor #${idDoctorAsignado}`}.`
                    })()}
                  </p>
                </div>
              )}
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
                  onClick={async () => {
                    const idDoctorAsignado = doctorSeleccionadoPorCita[citaActiva.id] ?? citaActiva.idDoctor
                    await pasarAConsulta(citaActiva.id, idDoctorAsignado)
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

              {isReceptionOrAdmin && citaActiva.estado === 6 && !!citaActiva.consultaMedica && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await cerrarProcesoRecepcion(citaActiva.id)
                    cerrarDialogo()
                  }}
                  disabled={estadoLoadingId === citaActiva.id}
                >
                  {estadoLoadingId === citaActiva.id ? "Actualizando..." : "Cerrar proceso (Gracias por venir)"}
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
