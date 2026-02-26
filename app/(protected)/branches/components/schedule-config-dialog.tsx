"use client"

import { AlertTriangle, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AsuetoSucursalResponseDto, DiaSemanaConfig } from "@/types/horario-sucursal"
import { SucursalResponseDto } from "@/types/sucursal"

type ScheduleConfigDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  canManage: boolean
  loading: boolean
  saving: boolean
  error: string | null
  info: string | null
  selectedSucursal: SucursalResponseDto | null
  configDias: DiaSemanaConfig[]
  onUpdateDay: (diaSemana: number, changes: Partial<DiaSemanaConfig>) => void
  onGuardar: () => Promise<void> | void
  asuetos: AsuetoSucursalResponseDto[]
  fechaAsueto: string
  onFechaAsuetoChange: (value: string) => void
  motivoAsueto: string
  onMotivoAsuetoChange: (value: string) => void
  asuetoLoading: boolean
  onCrearAsueto: () => Promise<void> | void
  onEliminarAsueto: (id: number) => Promise<void> | void
}

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function ScheduleConfigDialog({
  open,
  onOpenChange,
  canManage,
  loading,
  saving,
  error,
  info,
  selectedSucursal,
  configDias,
  onUpdateDay,
  onGuardar,
  asuetos,
  fechaAsueto,
  onFechaAsuetoChange,
  motivoAsueto,
  onMotivoAsuetoChange,
  asuetoLoading,
  onCrearAsueto,
  onEliminarAsueto,
}: ScheduleConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-[94vw] sm:max-w-[1320px] max-h-[88vh] overflow-hidden p-0">
        <div className="flex max-h-[88vh] flex-col p-6">
        <DialogHeader>
          <DialogTitle>
            Configuración de horarios: {selectedSucursal?.nombre ?? "Sucursal"}
          </DialogTitle>
          <DialogDescription>
            Define horarios semanales y asuetos por fecha. Los cambios aplican inmediatamente.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-4 overflow-y-auto pr-1">
        {!canManage && (
          <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            Solo administradores pueden editar horarios y asuetos.
          </div>
        )}

        <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4" />
            <p>
              Sábado y domingo pueden quedar cerrados como regla semanal. Los asuetos son fechas puntuales
              (festividades o cierres propios del negocio) y no reemplazan tu regla semanal.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando configuración de sucursal...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-base">Horario semanal</CardTitle>
                <CardDescription>Configura días laborales y horas de atención.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                {configDias.map((dia) => (
                  <div key={dia.diaSemana} className="rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-medium">{dia.nombre}</p>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={dia.cerrado}
                          disabled={!canManage}
                          onChange={(e) => onUpdateDay(dia.diaSemana, { cerrado: e.target.checked })}
                        />
                        Cerrado
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`hora-inicio-${dia.diaSemana}`}>Inicio</Label>
                        <Input
                          id={`hora-inicio-${dia.diaSemana}`}
                          type="time"
                          value={dia.horaInicio}
                          disabled={dia.cerrado || !canManage}
                          onChange={(e) => onUpdateDay(dia.diaSemana, { horaInicio: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`hora-fin-${dia.diaSemana}`}>Fin</Label>
                        <Input
                          id={`hora-fin-${dia.diaSemana}`}
                          type="time"
                          value={dia.horaFin}
                          disabled={dia.cerrado || !canManage}
                          onChange={(e) => onUpdateDay(dia.diaSemana, { horaFin: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="py-4">
                <CardHeader className="px-4">
                  <CardTitle className="text-base">Agregar asueto</CardTitle>
                  <CardDescription>Marca fechas donde no se atenderá en la sucursal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-4">
                  <div className="space-y-1">
                    <Label htmlFor="fecha-asueto">Fecha</Label>
                    <Input
                      id="fecha-asueto"
                      type="date"
                      value={fechaAsueto}
                      disabled={!canManage || asuetoLoading}
                      onChange={(e) => onFechaAsuetoChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="motivo-asueto">Motivo (opcional)</Label>
                    <Input
                      id="motivo-asueto"
                      value={motivoAsueto}
                      disabled={!canManage || asuetoLoading}
                      onChange={(e) => onMotivoAsuetoChange(e.target.value)}
                      placeholder="Ej. Asueto nacional"
                    />
                  </div>

                  <Button className="hc-action-btn" onClick={onCrearAsueto} disabled={!canManage || asuetoLoading || !fechaAsueto}>
                    {asuetoLoading ? "Guardando..." : "Agregar asueto"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="py-4">
                <CardHeader className="px-4">
                  <CardTitle className="text-base">Asuetos configurados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-4">
                  {asuetos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay asuetos registrados.</p>
                  ) : (
                    asuetos.map((asueto) => (
                      <div key={asueto.id} className="flex items-center justify-between gap-3 rounded-md border p-2 text-sm">
                        <div>
                          <p className="font-medium">{formatDate(asueto.fecha)}</p>
                          <p className="text-muted-foreground">{asueto.motivo || "Sin motivo"}</p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canManage || asuetoLoading}
                          onClick={() => onEliminarAsueto(asueto.id)}
                        >
                          <Trash2 className="size-4" />
                          Quitar
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        </div>
        <div className="min-h-8 pt-2">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {info && !error && (
            <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
              {info}
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
          <Button className="hc-action-btn" onClick={onGuardar} disabled={!canManage || saving || loading}>
            <Save className="size-4" />
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
