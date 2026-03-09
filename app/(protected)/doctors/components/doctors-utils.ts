import { UsuarioRol } from "@/types/usuario"

export const ROL_OPTIONS: Array<{ value: UsuarioRol; label: string }> = [
  { value: 2, label: "Doctor" },
  { value: 4, label: "Nutricionista" },
  { value: 5, label: "Fisioterapeuta" },
  { value: 3, label: "Recepcionista" },
]

export function rolToLabel(idRol: UsuarioRol, nombreRol?: string) {
  if (nombreRol?.trim()) return nombreRol
  if (idRol === 1) return "Admin"
  if (idRol === 2) return "Doctor"
  if (idRol === 3) return "Recepcionista"
  if (idRol === 4) return "Nutricionista"
  if (idRol === 5) return "Fisioterapeuta"
  return `Rol #${idRol}`
}

export function rolRequiereEspecialidad(idRol: UsuarioRol) {
  return idRol === 2 || idRol === 4 || idRol === 5
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
