"use client"

import { Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SucursalResponseDto } from "@/types/sucursal"
import { ROL_OPTIONS } from "./doctors-utils"

type Props = {
  sucursales: SucursalResponseDto[]
  rolFiltro: string
  onRolFiltroChange: (value: string) => void
  sucursalFiltro: string
  onSucursalFiltroChange: (value: string) => void
  buscarNombre: string
  onBuscarNombreChange: (value: string) => void
  showInactive: boolean
  onToggleInactive: () => void
}

export function DoctorsFilters({
  sucursales,
  rolFiltro,
  onRolFiltroChange,
  sucursalFiltro,
  onSucursalFiltroChange,
  buscarNombre,
  onBuscarNombreChange,
  showInactive,
  onToggleInactive,
}: Props) {
  return (
    <Card className="hc-soft-card py-0">
      <CardHeader className="hc-hero py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">Filtros de visualización</CardTitle>
            <CardDescription>
              Busca por nombre y filtra por rol/sucursal.
            </CardDescription>
          </div>

          <Button variant={showInactive ? "default" : "outline"} onClick={onToggleInactive}>
            <Trash2 className="size-4" />
            {showInactive ? "Viendo inactivos" : "Ver inactivos"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 py-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="buscar-nombre">Buscar por nombre</Label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" />
            <Input
              id="buscar-nombre"
              value={buscarNombre}
              onChange={(e) => onBuscarNombreChange(e.target.value)}
              placeholder="Ej. Juan"
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filtro-rol">Filtrar por rol</Label>
          <select
            id="filtro-rol"
            value={rolFiltro}
            onChange={(e) => onRolFiltroChange(e.target.value)}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
          >
            <option value="all">Todos</option>
            {ROL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filtro-sucursal">Filtrar por sucursal</Label>
          <select
            id="filtro-sucursal"
            value={sucursalFiltro}
            onChange={(e) => onSucursalFiltroChange(e.target.value)}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
          >
            <option value="all">Todas las sucursales</option>
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={String(sucursal.id)}>
                {sucursal.nombre}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
