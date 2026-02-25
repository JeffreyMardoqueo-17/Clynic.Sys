"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Building2, CalendarClock, Clock3, Image, MapPin, Plus, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/auth.service"
import { horarioSucursalService } from "@/services/horario-sucursal.service"
import { sucursalService } from "@/services/sucursal.service"
import { DiaSemanaConfig, HorarioSucursalResponseDto } from "@/types/horario-sucursal"
import { SucursalResponseDto } from "@/types/sucursal"

const DIAS_SEMANA: Array<{ diaSemana: number; nombre: string }> = [
  { diaSemana: 1, nombre: "Lunes" },
  { diaSemana: 2, nombre: "Martes" },
  { diaSemana: 3, nombre: "Miércoles" },
  { diaSemana: 4, nombre: "Jueves" },
  { diaSemana: 5, nombre: "Viernes" },
  { diaSemana: 6, nombre: "Sábado" },
  { diaSemana: 7, nombre: "Domingo" },
]

function defaultConfig(): DiaSemanaConfig[] {
  return DIAS_SEMANA.map((dia) => ({
    diaSemana: dia.diaSemana,
    nombre: dia.nombre,
    cerrado: dia.diaSemana >= 6,
    horaInicio: "08:00",
    horaFin: "17:00",
  }))
}

function normalizeDiaSemana(dia: number) {
  if (dia === 0) return 7
  return dia
}

function jsDayToApiDay(day: number) {
  return day === 0 ? 7 : day
}

export default function BranchesPage() {
  const [clinicId, setClinicId] = useState<number | null>(null)
  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [nombreSucursal, setNombreSucursal] = useState("")
  const [direccionSucursal, setDireccionSucursal] = useState("")

  const [horarioOpen, setHorarioOpen] = useState(false)
  const [horarioLoading, setHorarioLoading] = useState(false)
  const [horarioSaving, setHorarioSaving] = useState(false)
  const [horarioError, setHorarioError] = useState<string | null>(null)
  const [horarioInfo, setHorarioInfo] = useState<string | null>(null)
  const [selectedSucursal, setSelectedSucursal] = useState<SucursalResponseDto | null>(null)
  const [horariosExistentes, setHorariosExistentes] = useState<HorarioSucursalResponseDto[]>([])
  const [horariosPorSucursal, setHorariosPorSucursal] = useState<Record<number, HorarioSucursalResponseDto[]>>({})
  const [configDias, setConfigDias] = useState<DiaSemanaConfig[]>(defaultConfig())
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>(new Date())

  const selectedApiDay = useMemo(() => {
    if (!fechaSeleccionada) return 1
    return jsDayToApiDay(fechaSeleccionada.getDay())
  }, [fechaSeleccionada])

  const selectedDayConfig = useMemo(
    () => configDias.find((dia) => dia.diaSemana === selectedApiDay),
    [configDias, selectedApiDay]
  )

  const loadSucursales = async (idClinica: number) => {
    const data = await sucursalService.obtenerPorClinica(idClinica)
    setSucursales(data)

    const resultados = await Promise.all(
      data.map(async (sucursal) => {
        try {
          const horarios = await horarioSucursalService.obtenerPorSucursal(sucursal.id)
          return { sucursalId: sucursal.id, horarios }
        } catch {
          return { sucursalId: sucursal.id, horarios: [] }
        }
      })
    )

    const horariosMap = resultados.reduce<Record<number, HorarioSucursalResponseDto[]>>(
      (acc, item) => {
        acc[item.sucursalId] = item.horarios
        return acc
      },
      {}
    )

    setHorariosPorSucursal(horariosMap)
  }

  const getResumenHorario = (sucursalId: number) => {
    const horarios = horariosPorSucursal[sucursalId] ?? []
    if (horarios.length === 0) {
      return "Sin horarios configurados"
    }

    const dias = horarios
      .map((h) => normalizeDiaSemana(h.diaSemana))
      .sort((a, b) => a - b)

    const primerDia = DIAS_SEMANA.find((d) => d.diaSemana === dias[0])?.nombre ?? "Día"
    const ultimoDia = DIAS_SEMANA.find((d) => d.diaSemana === dias[dias.length - 1])?.nombre ?? "Día"

    const horarioReferencia = horarios[0]
    const rango = `${(horarioReferencia.horaInicio ?? "08:00").slice(0, 5)} - ${(horarioReferencia.horaFin ?? "17:00").slice(0, 5)}`

    return `${primerDia} a ${ultimoDia} · ${rango} · ${horarios.length} día(s)`
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const perfil = await authService.getProfile()
        setClinicId(perfil.idClinica)
        await loadSucursales(perfil.idClinica)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la información")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const handleCreateSucursal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId) return

    setCreateLoading(true)
    setError(null)

    try {
      await sucursalService.crear({
        idClinica: clinicId,
        nombre: nombreSucursal.trim(),
        direccion: direccionSucursal.trim(),
      })

      setNombreSucursal("")
      setDireccionSucursal("")
      setCreateOpen(false)
      await loadSucursales(clinicId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la sucursal")
    } finally {
      setCreateLoading(false)
    }
  }

  const openHorarioConfig = async (sucursal: SucursalResponseDto) => {
    setSelectedSucursal(sucursal)
    setHorarioOpen(true)
    setHorarioLoading(true)
    setHorarioError(null)
    setHorarioInfo(null)

    try {
      const horarios = await horarioSucursalService.obtenerPorSucursal(sucursal.id)
      setHorariosExistentes(horarios)

      const merged = defaultConfig().map((dia) => {
        const horario = horarios.find(
          (h) => normalizeDiaSemana(h.diaSemana) === dia.diaSemana
        )

        if (!horario) {
          return dia
        }

        return {
          ...dia,
          cerrado: false,
          horaInicio: (horario.horaInicio ?? "08:00").slice(0, 5),
          horaFin: (horario.horaFin ?? "17:00").slice(0, 5),
        }
      })

      setConfigDias(merged)
    } catch (err) {
      setHorarioError(err instanceof Error ? err.message : "No se pudo cargar horarios")
      setConfigDias(defaultConfig())
    } finally {
      setHorarioLoading(false)
    }
  }

  const updateDay = (diaSemana: number, changes: Partial<DiaSemanaConfig>) => {
    setConfigDias((prev) =>
      prev.map((d) => (d.diaSemana === diaSemana ? { ...d, ...changes } : d))
    )
  }

  const handleGuardarHorarios = async () => {
    if (!selectedSucursal) return

    setHorarioSaving(true)
    setHorarioError(null)
    setHorarioInfo(null)

    try {
      const diasConHorarioExistente = new Set(
        horariosExistentes.map((h) => normalizeDiaSemana(h.diaSemana))
      )

      const crear = configDias.filter(
        (dia) => !dia.cerrado && !diasConHorarioExistente.has(dia.diaSemana)
      )

      const omitidos = configDias.filter(
        (dia) => !dia.cerrado && diasConHorarioExistente.has(dia.diaSemana)
      )

      if (crear.length === 0) {
        setHorarioInfo(
          "No hay nuevos horarios por crear. Los días ya existentes requieren endpoint de actualización/eliminación."
        )
        return
      }

      await Promise.all(
        crear.map((dia) =>
          horarioSucursalService.crear({
            idSucursal: selectedSucursal.id,
            diaSemana: dia.diaSemana,
            horaInicio: `${dia.horaInicio}:00`,
            horaFin: `${dia.horaFin}:00`,
          })
        )
      )

      const horariosActualizados = await horarioSucursalService.obtenerPorSucursal(selectedSucursal.id)
      setHorariosExistentes(horariosActualizados)
      setHorarioInfo(
        `Configuración guardada. Horarios creados: ${crear.length}. Días omitidos por existir: ${omitidos.length}.`
      )
    } catch (err) {
      setHorarioError(err instanceof Error ? err.message : "No se pudieron guardar horarios")
    } finally {
      setHorarioSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando configuración de sucursales...</p>
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="hc-page-title text-3xl font-bold tracking-tight">Sucursales</h1>
          <p className="text-sm text-muted-foreground">
            Administra sucursales, horarios de atención y días cerrados de tu clínica.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="hc-action-btn">
              <Plus className="size-4" />
              Nueva sucursal
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCreateSucursal} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Crear sucursal</DialogTitle>
                <DialogDescription>
                  Completa los datos básicos para registrar una nueva sucursal.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="nombre-sucursal">Nombre</Label>
                <Input
                  id="nombre-sucursal"
                  value={nombreSucursal}
                  onChange={(e) => setNombreSucursal(e.target.value)}
                  placeholder="Sucursal Centro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion-sucursal">Dirección</Label>
                <Input
                  id="direccion-sucursal"
                  value={direccionSucursal}
                  onChange={(e) => setDireccionSucursal(e.target.value)}
                  placeholder="Zona 10, Guatemala"
                  required
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? "Guardando..." : "Crear sucursal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {sucursales.map((sucursal) => (
          <Card key={sucursal.id} className="hc-soft-card overflow-hidden py-0">
            <div className="hc-hero p-4">
              <div className="flex items-center gap-3">
                <div className="hc-icon-badge flex size-14 items-center justify-center">
                  <Image className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Foto sucursal (próximamente)
                  </p>
                  <p className="text-sm font-medium">Placeholder visual del local</p>
                </div>
              </div>
            </div>

            <CardHeader className="pt-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="size-5" />
                {sucursal.nombre}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {sucursal.direccion}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pb-5">
              <div className="hc-info-chip p-3 text-sm">
                <p className="mb-1 flex items-center gap-1.5 font-medium">
                  <Clock3 className="size-4 text-muted-foreground" />
                  Horarios
                </p>
                <p className="text-muted-foreground">{getResumenHorario(sucursal.id)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
              <Button className="hc-action-btn" onClick={() => openHorarioConfig(sucursal)}>
                <CalendarClock className="size-4" />
                Configurar horarios
              </Button>

              <Button variant="outline" className="hc-action-btn-outline" disabled>
                Desactivar sucursal (próximamente)
              </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sucursales.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aún no hay sucursales registradas para esta clínica.
          </CardContent>
        </Card>
      )}

      <Dialog open={horarioOpen} onOpenChange={setHorarioOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              Configuración de horarios: {selectedSucursal?.nombre ?? "Sucursal"}
            </DialogTitle>
            <DialogDescription>
              Define el horario semanal por día. Si un día está marcado como cerrado, no se crea horario.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4" />
              <p>
                Nota API actual: solo existe endpoint para crear horarios. Editar o eliminar horarios ya creados
                requiere endpoints `PUT/DELETE` en backend.
              </p>
            </div>
          </div>

          {horarioLoading ? (
            <p className="text-sm text-muted-foreground">Cargando horarios de sucursal...</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="py-4">
                <CardContent className="px-4">
                  <Calendar
                    mode="single"
                    selected={fechaSeleccionada}
                    onSelect={setFechaSeleccionada}
                    className="p-0"
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="py-4">
                  <CardHeader className="px-4">
                    <CardTitle className="text-base">
                      Día seleccionado: {selectedDayConfig?.nombre}
                    </CardTitle>
                    <CardDescription>
                      Configura hora de apertura/cierre o marca día cerrado.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 px-4">
                    {selectedDayConfig && (
                      <>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedDayConfig.cerrado}
                            onChange={(e) =>
                              updateDay(selectedDayConfig.diaSemana, { cerrado: e.target.checked })
                            }
                          />
                          Día cerrado
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="hora-inicio">Hora inicio</Label>
                            <Input
                              id="hora-inicio"
                              type="time"
                              value={selectedDayConfig.horaInicio}
                              disabled={selectedDayConfig.cerrado}
                              onChange={(e) =>
                                updateDay(selectedDayConfig.diaSemana, { horaInicio: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="hora-fin">Hora fin</Label>
                            <Input
                              id="hora-fin"
                              type="time"
                              value={selectedDayConfig.horaFin}
                              disabled={selectedDayConfig.cerrado}
                              onChange={(e) =>
                                updateDay(selectedDayConfig.diaSemana, { horaFin: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="py-4">
                  <CardHeader className="px-4">
                    <CardTitle className="text-base">Resumen semanal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 px-4 text-sm">
                    {configDias.map((dia) => (
                      <p key={dia.diaSemana}>
                        <span className="font-medium">{dia.nombre}:</span>{" "}
                        {dia.cerrado ? "Cerrado" : `${dia.horaInicio} - ${dia.horaFin}`}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {horarioError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {horarioError}
            </p>
          )}

          {horarioInfo && (
            <p className="rounded-md bg-accent/35 px-3 py-2 text-sm text-muted-foreground">
              {horarioInfo}
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
            <Button className="hc-action-btn" onClick={handleGuardarHorarios} disabled={horarioSaving || horarioLoading}>
              <Save className="size-4" />
              {horarioSaving ? "Guardando..." : "Guardar configuración"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
