export interface CreateSucursalDto {
  idClinica: number
  nombre: string
  direccion: string
}

export interface SucursalResponseDto {
  id: number
  idClinica: number
  nombre: string
  direccion: string
  activa: boolean
}
