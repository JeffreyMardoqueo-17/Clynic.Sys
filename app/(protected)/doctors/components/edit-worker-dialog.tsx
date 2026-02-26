"use client"

import { UserPen } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SucursalResponseDto } from "@/types/sucursal"
import { UsuarioRol } from "@/types/usuario"
import { ROL_OPTIONS } from "./doctors-utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent) => Promise<void> | void
  submitting: boolean
  nombreCompleto: string
  onNombreCompletoChange: (value: string) => void
  correo: string
  onCorreoChange: (value: string) => void
  rol: UsuarioRol
  onRolChange: (value: UsuarioRol) => void
  idSucursal: string
  onIdSucursalChange: (value: string) => void
  sucursales: SucursalResponseDto[]
}

export function EditWorkerDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  nombreCompleto,
  onNombreCompletoChange,
  correo,
  onCorreoChange,
  rol,
  onRolChange,
  idSucursal,
  onIdSucursalChange,
  sucursales,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPen className="h-5 w-5" />
            Editar trabajador
          </DialogTitle>
          <DialogDescription>Actualiza los datos básicos del trabajador.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nombre">Nombre completo</Label>
            <Input
              id="edit-nombre"
              value={nombreCompleto}
              onChange={(e) => onNombreCompletoChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-correo">Correo</Label>
            <Input
              id="edit-correo"
              type="email"
              value={correo}
              onChange={(e) => onCorreoChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-rol">Rol</Label>
            <select
              id="edit-rol"
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
            <Label htmlFor="edit-sucursal">Sucursal</Label>
            <select
              id="edit-sucursal"
              value={idSucursal}
              onChange={(e) => onIdSucursalChange(e.target.value)}
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
              <Button type="button" variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting || !nombreCompleto.trim() || !correo.trim()}>
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
