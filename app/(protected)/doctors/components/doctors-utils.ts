import { UsuarioRol } from "@/types/usuario"

type RoleLike = {
  id: UsuarioRol
  nombre: string
}

export function rolToLabel(idRol: UsuarioRol, nombreRol?: string) {
  if (nombreRol?.trim()) return nombreRol
  if (idRol === 1) return "Admin"
  if (idRol === 2) return "Doctor"
  if (idRol === 3) return "Recepcionista"
  return `Rol #${idRol}`
}

export function rolRequiereEspecialidad(idRol: UsuarioRol) {
  return idRol === 2
}

export function rolRequiereEspecialidadPorNombre(nombreRol?: string | null) {
  return (nombreRol ?? "").trim().toLowerCase() === "doctor"
}

export function buildRoleOptions(roles: RoleLike[]): Array<{ value: UsuarioRol; label: string }> {
  return roles.map((rol) => ({
    value: rol.id,
    label: rol.nombre,
  }))
}

export function formatDate(value: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
