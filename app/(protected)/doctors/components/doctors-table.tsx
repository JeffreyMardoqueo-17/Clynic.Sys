"use client"

import { AlertTriangle, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UsuarioResponseDto } from "@/types/usuario"
import { formatDate, rolToLabel } from "./doctors-utils"

type Props = {
  data: UsuarioResponseDto[]
  showInactive: boolean
  onView: (usuario: UsuarioResponseDto) => void
  onEdit: (usuario: UsuarioResponseDto) => void
  onDelete: (usuario: UsuarioResponseDto) => void
  onReactivate: (usuario: UsuarioResponseDto) => void
}

export function DoctorsTable({ data, showInactive, onView, onEdit, onDelete, onReactivate }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Sucursal</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="w-28">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                {showInactive
                  ? "No hay trabajadores inactivos con esos filtros."
                  : "No hay trabajadores activos con esos filtros."}
              </TableCell>
            </TableRow>
          ) : (
            data.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">
                  {usuario.nombreCompleto}
                </TableCell>
                <TableCell>{usuario.correo}</TableCell>
                <TableCell>
                  {rolToLabel(usuario.rol)}
                </TableCell>
                <TableCell>{usuario.nombreSucursal ?? "Sin asignar"}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={
                        usuario.activo
                          ? "inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                          : "inline-flex rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300"
                      }
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </span>

                    {usuario.debeCambiarClave && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3" />
                        Clave temporal
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDate(usuario.fechaCreacion)}</TableCell>
                <TableCell>
                  <div className="flex min-w-24 items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 border-yellow-500/40 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-300"
                      onClick={() => onView(usuario)}
                      title="Ver"
                      aria-label="Ver trabajador"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 border-orange-500/40 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
                      onClick={() => onEdit(usuario)}
                      title="Editar"
                      aria-label="Editar trabajador"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {showInactive ? (
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                        onClick={() => onReactivate(usuario)}
                        title="Activar"
                        aria-label="Activar trabajador"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-red-500/40 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300"
                        onClick={() => onDelete(usuario)}
                        title="Eliminar"
                        aria-label="Eliminar trabajador"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
