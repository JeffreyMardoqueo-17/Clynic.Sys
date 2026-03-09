export type UsuarioRol = number

export interface UsuarioResponseDto {
  id: number
  nombreCompleto: string
  correo: string
  idRol: UsuarioRol
  nombreRol: string
  descripcionRol?: string
  idEspecialidad?: number
  nombreEspecialidad?: string
  activo: boolean
  debeCambiarClave?: boolean
  idClinica: number
  nombreClinica?: string
  idSucursal?: number
  nombreSucursal?: string
  fechaCreacion: string
}

export interface CreateTrabajadorDto {
  nombreCompleto: string
  correo: string
  idClinica: number
  idSucursal: number
  idRol: UsuarioRol
  idEspecialidad?: number
}

export interface UpdateTrabajadorDto {
  nombreCompleto?: string
  correo?: string
  idSucursal?: number
  idRol?: UsuarioRol
  idEspecialidad?: number
  activo?: boolean
}
