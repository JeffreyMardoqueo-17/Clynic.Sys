"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UsuarioResponseDto } from "@/types/usuario"
import { formatDate, rolToLabel } from "./doctors-utils"

type Props = {
  open: boolean
  usuario: UsuarioResponseDto | null
  onOpenChange: (open: boolean) => void
}

export function DoctorViewDialog({ open, usuario, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalle de trabajador</DialogTitle>
          <DialogDescription>Información general del usuario seleccionado.</DialogDescription>
        </DialogHeader>

        {usuario ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs uppercase">Nombre</p>
                <p className="font-medium">{usuario.nombreCompleto}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs uppercase">Rol</p>
                <p className="font-medium">{rolToLabel(usuario.rol)}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs uppercase">Email</p>
                <p className="font-medium">{usuario.correo}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs uppercase">Estado</p>
                <p className="font-medium">{usuario.activo ? "Activo" : "Inactivo"}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs uppercase">ID usuario</p>
                <p className="font-medium">{usuario.id}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs uppercase">Fecha de registro</p>
                <p className="font-medium">{formatDate(usuario.fechaCreacion)}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs uppercase">Clínica</p>
                <p className="font-medium">{usuario.nombreClinica ?? `ID ${usuario.idClinica}`}</p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-xs uppercase">Sucursal</p>
                <p className="font-medium">{usuario.nombreSucursal ?? "Sin asignar"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
