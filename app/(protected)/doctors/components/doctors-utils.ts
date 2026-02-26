import { UsuarioRol } from "@/types/usuario"

export const ROL_OPTIONS: Array<{ value: UsuarioRol; label: string }> = [
  { value: 2, label: "Doctor" },
  { value: 3, label: "Recepcionista" },
]

export function rolToLabel(rol: UsuarioRol) {
  if (rol === 1) return "Admin"
  if (rol === 2) return "Doctor"
  return "Recepcionista"
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
