"use client"

import { UserRoundPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { SucursalResponseDto } from "@/types/sucursal"
import { UsuarioRol } from "@/types/usuario"
import { ROL_OPTIONS } from "./doctors-utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
  nombreCompleto: string
  onNombreCompletoChange: (value: string) => void
  correo: string
  onCorreoChange: (value: string) => void
  rol: UsuarioRol
  onRolChange: (value: UsuarioRol) => void
  idSucursalCrear: string
  onIdSucursalCrearChange: (value: string) => void
  sucursales: SucursalResponseDto[]
  onSubmit: (e: React.FormEvent) => Promise<void> | void
}

export function CreateWorkerDialog({
  open,
  onOpenChange,
  loading,
  nombreCompleto,
  onNombreCompletoChange,
  correo,
  onCorreoChange,
  rol,
  onRolChange,
  idSucursalCrear,
  onIdSucursalCrearChange,
  sucursales,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hc-action-btn">
          <UserRoundPlus className="size-4" />
          Nuevo trabajador
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Registrar trabajador</DialogTitle>
            <DialogDescription>
              Ingresa datos básicos y rol. La contraseña temporal se genera automáticamente y se envía al correo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="nombre-trabajador">Nombre completo</Label>
            <Input
              id="nombre-trabajador"
              value={nombreCompleto}
              onChange={(e) => onNombreCompletoChange(e.target.value)}
              placeholder="Dr. Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo-trabajador">Correo</Label>
            <Input
              id="correo-trabajador"
              type="email"
              value={correo}
              onChange={(e) => onCorreoChange(e.target.value)}
              placeholder="doctor@clinica.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol-trabajador">Rol</Label>
            <select
              id="rol-trabajador"
              value={rol}
              onChange={(e) => onRolChange(Number(e.target.value) as UsuarioRol)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
              required
            >
              {ROL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sucursal-trabajador">Sucursal</Label>
            <select
              id="sucursal-trabajador"
              value={idSucursalCrear}
              onChange={(e) => onIdSucursalCrearChange(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
              required
            >
              {sucursales.length === 0 && <option value="">Sin sucursales disponibles</option>}
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={String(sucursal.id)}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear trabajador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
