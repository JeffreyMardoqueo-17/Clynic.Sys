export interface ServicioResponseDto {
  id: number
  idClinica: number
  idEspecialidad: number
  nombreEspecialidad: string
  nombreServicio: string
  duracionMin: number
  precioBase: number
  activo: boolean
}

export interface CreateServicioDto {
  idClinica: number
  idEspecialidad: number
  nombreServicio: string
  duracionMin: number
  precioBase: number
}

export interface UpdateServicioDto {
  idEspecialidad?: number
  nombreServicio?: string
  duracionMin?: number
  precioBase?: number
  activo?: boolean
}

export interface CapacidadEspecialidadDiaDto {
  fecha: string
  idEspecialidad: number
  nombreEspecialidad: string
  totalCitasAgendadas: number
  totalMinutosAgendados: number
  duracionPromedioCitaMin: number
  minutosLaborablesDia: number
  minutosDisponiblesDia: number
  citasPosiblesDia: number
  citasDisponiblesDia: number
  saturacionPct: number
}
