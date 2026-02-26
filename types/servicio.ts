export interface ServicioResponseDto {
  id: number
  idClinica: number
  nombreServicio: string
  duracionMin: number
  precioBase: number
  activo: boolean
}

export interface CreateServicioDto {
  idClinica: number
  nombreServicio: string
  duracionMin: number
  precioBase: number
}

export interface UpdateServicioDto {
  nombreServicio?: string
  duracionMin?: number
  precioBase?: number
  activo?: boolean
}
