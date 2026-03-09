"use client"

import Link from "next/link"
import { useMemo } from "react"
import { BellRing, ClipboardPlus, Stethoscope, UserRound, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CitaResponseDto } from "@/types/cita"
import { SucursalResponseDto } from "@/types/sucursal"

type DoctorConsultationWorkbenchProps = {
  idUsuario: number
  citas: CitaResponseDto[]
  sucursales: SucursalResponseDto[]
  citasDoctorEnConsulta: CitaResponseDto[]
  siguienteCitaDoctor: CitaResponseDto | null
  citaDoctorActiva: CitaResponseDto | null
  tomandoSiguienteDoctor: boolean
  tomarSiguientePacienteDoctor: () => Promise<void>
}

export function DoctorConsultationWorkbench({
  idUsuario,
  citas,
  sucursales,
  citasDoctorEnConsulta,
  siguienteCitaDoctor,
  citaDoctorActiva,
  tomandoSiguienteDoctor,
  tomarSiguientePacienteDoctor,
}: DoctorConsultationWorkbenchProps) {
  const citasPorRecibir = useMemo(
    () => [...citas]
      .filter((cita) => cita.idDoctor === idUsuario && cita.estado === 5 && !cita.consultaMedica)
      .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime()),
    [citas, idUsuario]
  )

  const sucursalActiva = citaDoctorActiva
    ? sucursales.find((s) => s.id === citaDoctorActiva.idSucursal)?.nombre ?? `Sucursal ${citaDoctorActiva.idSucursal}`
    : ""

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardPlus className="size-5 text-primary" /> Casos pendientes</CardTitle>
            <CardDescription>Pacientes en recepción listos para tu atención (orden FIFO)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {citasPorRecibir.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes casos pendientes por recibir.</p>
            ) : (
              citasPorRecibir.map((cita) => (
                <div
                  key={cita.id}
                  className="space-y-2 rounded-md border border-border bg-card p-3"
                >
                  <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                  <p className="text-xs text-muted-foreground">{new Date(cita.fechaHoraInicioPlan).toLocaleString()}</p>
                  <Badge variant="outline">En cola de recepción</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" /> Caso activo</CardTitle>
            <CardDescription>Selecciona una cita en consulta para abrir su expediente detallado</CardDescription>
          </CardHeader>
          <CardContent>
            {citaDoctorActiva ? (
              <div className="space-y-2 rounded-md border border-border bg-card p-3 text-sm">
                <p><span className="font-medium">Paciente:</span> {citaDoctorActiva.nombrePaciente}</p>
                <p><span className="font-medium">Correo:</span> {citaDoctorActiva.correoPaciente || "N/A"}</p>
                <p><span className="font-medium">Teléfono:</span> {citaDoctorActiva.telefonoPaciente || "N/A"}</p>
                <p><span className="font-medium">Sucursal:</span> {sucursalActiva}</p>
                <Link href={`/appointment/consulta/${citaDoctorActiva.id}`}>
                  <Button className="mt-2 w-full gap-2">
                    Ver expediente detallado <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Todavía no has abierto un caso activo.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BellRing className="size-5 text-primary" /> Pacientes en consulta</CardTitle>
          <CardDescription>{citasDoctorEnConsulta.length} caso(s) listos para abrir en detalle</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {citasDoctorEnConsulta.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay pacientes en consulta en este momento.</p>
          ) : (
            citasDoctorEnConsulta.map((cita) => (
              <div key={cita.id} className="rounded-md border border-border bg-card p-3">
                <p className="text-sm font-semibold">#{cita.id} · {cita.nombrePaciente}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(cita.fechaHoraInicioPlan).toLocaleString()} · {sucursales.find((s) => s.id === cita.idSucursal)?.nombre ?? `Sucursal ${cita.idSucursal}`}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge>En consulta</Badge>
                  <Link href={`/appointment/consulta/${cita.id}`}>
                    <Button size="sm" variant="default" className="gap-2">
                      Abrir <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Stethoscope className="size-5" /> Próximo en cola</CardTitle>
          <CardDescription>Acceso rápido al siguiente paciente transferido por recepción</CardDescription>
        </CardHeader>
        <CardContent>
          {siguienteCitaDoctor ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-base font-semibold">#{siguienteCitaDoctor.id} · {siguienteCitaDoctor.nombrePaciente}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(siguienteCitaDoctor.fechaHoraInicioPlan).toLocaleString()} · {sucursales.find((s) => s.id === siguienteCitaDoctor.idSucursal)?.nombre ?? `Sucursal ${siguienteCitaDoctor.idSucursal}`}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" onClick={tomarSiguientePacienteDoctor} disabled={tomandoSiguienteDoctor}>
                  {tomandoSiguienteDoctor ? "Tomando..." : "Tomar siguiente"}
                </Button>
                <Link href={`/appointment/consulta/${siguienteCitaDoctor.id}`}>
                  <Button type="button" variant="outline" className="gap-2">
                    Ver expediente <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay citas en cola por ahora.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
