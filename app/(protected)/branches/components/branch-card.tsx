"use client"

import { Building2, CalendarClock, Clock3, ImageIcon, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SucursalResponseDto } from "@/types/sucursal"

type BranchCardProps = {
  sucursal: SucursalResponseDto
  resumenHorario: string
  resumenAsuetos: string
  canManage: boolean
  onConfigurarHorarios: (sucursal: SucursalResponseDto) => void
}

export function BranchCard({
  sucursal,
  resumenHorario,
  resumenAsuetos,
  canManage,
  onConfigurarHorarios,
}: BranchCardProps) {
  return (
    <Card className="hc-soft-card overflow-hidden border-primary/10 py-0">
      <div className="hc-hero bg-gradient-to-r from-primary/10 via-accent/30 to-background p-3">
        <div className="flex items-center gap-3">
          <div className="hc-icon-badge flex size-11 items-center justify-center">
            <ImageIcon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Foto sucursal (próximamente)
            </p>
            <p className="text-xs font-medium">Placeholder visual del local</p>
          </div>
        </div>
      </div>

      <CardHeader className="space-y-1 pt-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-4.5" />
          {sucursal.nombre}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <MapPin className="size-3.5" />
          {sucursal.direccion}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2.5 pb-4">
        <div className="hc-info-chip bg-accent/35 p-2.5 text-xs">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
            <Clock3 className="size-3.5 text-muted-foreground" />
            Horarios
          </p>
          <p className="text-muted-foreground">{resumenHorario}</p>
        </div>

        <div className="hc-info-chip bg-primary/5 p-2.5 text-xs">
          <p className="mb-1 font-medium">Asuetos</p>
          <p className="text-muted-foreground">{resumenAsuetos}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            className="hc-action-btn h-8 px-3 text-xs"
            onClick={() => onConfigurarHorarios(sucursal)}
            disabled={!canManage}
            title={!canManage ? "Solo administradores" : undefined}
          >
            <CalendarClock className="size-3.5" />
            Configurar horarios
          </Button>

          <Button variant="outline" className="hc-action-btn-outline h-8 px-3 text-xs" disabled>
            Desactivar sucursal (próximamente)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
