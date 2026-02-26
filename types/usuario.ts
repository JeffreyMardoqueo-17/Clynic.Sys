export type UsuarioRol = 1 | 2 | 3

export interface UsuarioResponseDto {
  id: number
  nombreCompleto: string
  correo: string
  rol: UsuarioRol
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
  rol: UsuarioRol
}

export interface UpdateTrabajadorDto {
  nombreCompleto?: string
  correo?: string
  idSucursal?: number
  rol?: UsuarioRol
  activo?: boolean
}
