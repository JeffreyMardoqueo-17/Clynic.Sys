export interface CreateHorarioSucursalDto {
  idSucursal: number
  diaSemana: number
  horaInicio: string
  horaFin: string
}

export interface UpdateHorarioSucursalDto {
  diaSemana: number
  horaInicio: string
  horaFin: string
}

export interface CreateAsuetoSucursalDto {
  idSucursal: number
  fecha: string
  motivo?: string | null
}

export interface AsuetoSucursalResponseDto {
  id: number
  idSucursal: number
  fecha: string
  motivo?: string | null
  fechaCreacion: string
}

export interface HorarioSucursalResponseDto {
  id: number
  idSucursal: number
  diaSemana: number
  horaInicio?: string | null
  horaFin?: string | null
}

export type DiaSemanaConfig = {
  diaSemana: number
  nombre: string
  cerrado: boolean
  horaInicio: string
  horaFin: string
  horarioId?: number
}
