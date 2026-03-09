"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, BellRing, ClipboardList, Radio, Stethoscope, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { normalizeRole } from "@/lib/authorization"
import { authService } from "@/services/auth.service"
import { citaService } from "@/services/cita.service"
import { DoctorQueueRealtimeEvent, doctorRealtimeService } from "@/services/doctor-realtime.service"
import { sucursalService } from "@/services/sucursal.service"
import { CitaResponseDto } from "@/types/cita"
import { SucursalResponseDto } from "@/types/sucursal"

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

export default function DoctorPanelPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<DoctorQueueRealtimeEvent | null>(null)
  const [highlightedCitaId, setHighlightedCitaId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cola, setCola] = useState<CitaResponseDto[]>([])
  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [idDoctor, setIdDoctor] = useState(0)
  const lastQueueSizeRef = useRef(0)

  const colaRecepcion = useMemo(
    () => cola.filter((cita) => cita.estado === 5).sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime()),
    [cola]
  )

  const enConsulta = useMemo(
    () => cola.filter((cita) => cita.estado === 6).sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime()),
    [cola]
  )

  const siguiente = colaRecepcion[0] ?? null

  const nombreSucursal = (idSucursal: number) =>
    sucursales.find((item) => item.id === idSucursal)?.nombre ?? `Sucursal ${idSucursal}`

  const cargarCola = async (silent = false) => {
    try {
      if (!silent) {
        setError(null)
      }

      const data = await citaService.obtenerColaDoctor()
      setCola(data)

      if (silent && data.filter((cita) => cita.estado === 5).length > lastQueueSizeRef.current) {
        showToast("Tienes nuevos pacientes en recepción", "info")
      }

      lastQueueSizeRef.current = data.filter((cita) => cita.estado === 5).length
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la cola del doctor")
      }
    }
  }

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true)
      setError(null)

      try {
        const profile = await authService.getProfile()
        const role = normalizeRole(profile.rol)
        if (role !== "Doctor") {
          setError("Esta vista es exclusiva para doctores.")
          return
        }

        setIdDoctor(profile.id)

        const sucursalesData = await sucursalService.obtenerPorClinica(profile.idClinica)
        setSucursales(sucursalesData)

        await cargarCola()

        await doctorRealtimeService.connect(async (payload) => {
          setConnected(true)
          setLastEvent(payload)
          setHighlightedCitaId(payload.idCita)
          showToast(payload.mensaje, "info")
          await cargarCola(true)
        })

        setConnected(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el panel del doctor")
      } finally {
        setLoading(false)
      }
    }

    bootstrap()

    return () => {
      setConnected(false)
      doctorRealtimeService.disconnect().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (loading || error) {
      return
    }

    const interval = window.setInterval(() => {
      cargarCola(true)
    }, 10000)

    return () => window.clearInterval(interval)
  }, [loading, error])

  const tomarSiguiente = async () => {
    if (!siguiente) {
      showToast("No tienes pacientes en cola", "warning")
      return
    }

    setProcessing(true)
    setError(null)

    try {
      await citaService.cambiarEstado(siguiente.id, {
        nuevoEstado: 6,
        notasOperacion: `Doctor #${idDoctor} tomó el siguiente paciente desde panel doctor`,
      })

      showToast("Paciente llamado a consulta", "success")
      await cargarCola()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo tomar el siguiente paciente"
      setError(message)
      showToast(message, "error")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando panel de doctor...</p>
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border bg-linear-to-r from-sky-600 via-cyan-600 to-teal-600 p-6 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 left-20 h-36 w-36 rounded-full bg-black/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Stethoscope className="size-7" /> Panel Doctor en Vivo
            </h1>
            <p className="text-sm text-white/90">
              Recepción asigna y tú decides el ritmo de atención. Cuando entra un paciente nuevo, tu panel se actualiza automáticamente.
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-white/80">Estado de conexión</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold">
              <Radio className={`size-4 ${connected ? "animate-pulse text-emerald-300" : "text-red-300"}`} />
              {connected ? "Tiempo real activo" : "Desconectado"}
            </p>
          </div>
        </div>
      </section>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2"><ClipboardList className="size-4" /> Esperando en recepción</span>
              <Badge variant="outline">{colaRecepcion.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Pacientes asignados a ti y listos para pasar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2"><BellRing className="size-4" /> En consulta</span>
              <Badge>{enConsulta.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Pacientes que ya tomaste y están en tu atención</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2"><UserRound className="size-4" /> Siguiente recomendado</span>
              <Badge variant="secondary">FIFO</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {siguiente ? (
              <>
                <p className="text-sm font-semibold">#{siguiente.id} · {siguiente.nombrePaciente}</p>
                <p className="text-xs text-muted-foreground">{formatDate(siguiente.fechaHoraInicioPlan)}</p>
                <p className="text-xs text-muted-foreground">{nombreSucursal(siguiente.idSucursal)}</p>
                <Button onClick={tomarSiguiente} disabled={processing} className="w-full transition-transform hover:scale-[1.01]">
                  {processing ? "Llamando..." : "Llamar siguiente"}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No hay pacientes en espera.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {lastEvent && (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900 transition-all">
          <p className="font-semibold">Ultimo evento: {lastEvent.evento}</p>
          <p>{lastEvent.mensaje}</p>
          <p className="text-xs text-cyan-700">{new Date(lastEvent.fecha).toLocaleString()}</p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cola de recepción para ti</CardTitle>
            <CardDescription>Turnero en vivo: recepción ya marcó llegada y te asignó estos pacientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {colaRecepcion.length === 0 && <p className="text-sm text-muted-foreground">Sin pacientes esperando por ahora.</p>}
            {colaRecepcion.map((cita, index) => (
              <div
                key={cita.id}
                className={`rounded-xl border p-3 transition-all ${highlightedCitaId === cita.id ? "border-emerald-400 bg-emerald-50 shadow-sm ring-2 ring-emerald-200" : "bg-card"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">#{cita.id} · {cita.nombrePaciente}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(cita.fechaHoraInicioPlan)} · {nombreSucursal(cita.idSucursal)}</p>
                    </div>
                  </div>
                  <Badge variant="outline">En recepción</Badge>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/3 rounded-full bg-linear-to-r from-amber-400 to-orange-500" />
                </div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={async () => {
                    setProcessing(true)
                    try {
                      await citaService.cambiarEstado(cita.id, { nuevoEstado: 6, notasOperacion: "Doctor llamó paciente desde su panel" })
                      await cargarCola()
                    } catch (err) {
                      const message = err instanceof Error ? err.message : "No se pudo llamar paciente"
                      setError(message)
                      showToast(message, "error")
                    } finally {
                      setProcessing(false)
                    }
                  }} disabled={processing} className="transition-transform hover:scale-[1.02]">
                    Llamar
                  </Button>
                  <Link href={`/appointment/consulta/${cita.id}`}>
                    <Button size="sm" variant="outline" className="gap-2">Expediente <ArrowRight className="size-4" /></Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atención en curso</CardTitle>
            <CardDescription>Pacientes ya transferidos a consulta contigo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {enConsulta.length === 0 && <p className="text-sm text-muted-foreground">No tienes pacientes en consulta.</p>}
            {enConsulta.map((cita) => (
              <div key={cita.id} className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">#{cita.id} · {cita.nombrePaciente}</p>
                  <Badge variant="secondary">En consulta</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Inicio planificado: {formatDate(cita.fechaHoraInicioPlan)}</p>
                <Link href={`/appointment/consulta/${cita.id}`}>
                  <Button size="sm" variant="outline" className="mt-2 gap-2">Abrir consulta <ArrowRight className="size-4" /></Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
