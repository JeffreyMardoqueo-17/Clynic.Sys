"use client"

import { Plus } from "lucide-react"

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

type CreateBranchDialogProps = {
  canManage: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
  nombre: string
  onNombreChange: (value: string) => void
  direccion: string
  onDireccionChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => Promise<void> | void
}

export function CreateBranchDialog({
  canManage,
  open,
  onOpenChange,
  loading,
  nombre,
  onNombreChange,
  direccion,
  onDireccionChange,
  onSubmit,
}: CreateBranchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hc-action-btn" disabled={!canManage} title={!canManage ? "Solo administradores" : undefined}>
          <Plus className="size-4" />
          Nueva sucursal
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="space-y-4">
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
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              placeholder="Sucursal Centro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion-sucursal">Dirección</Label>
            <Input
              id="direccion-sucursal"
              value={direccion}
              onChange={(e) => onDireccionChange(e.target.value)}
              placeholder="Zona 10, Guatemala"
              required
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || !canManage}>
              {loading ? "Guardando..." : "Crear sucursal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
