export interface CreateClinicaDto {
  nombre: string
  telefono: string
  direccion: string
}

export interface ClinicaResponseDto {
  id: number
  nombre: string
  telefono: string
  direccion: string
  activa: boolean
  fechaCreacion: string
}
