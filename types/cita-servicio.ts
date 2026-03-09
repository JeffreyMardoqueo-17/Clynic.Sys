export interface CitaServicioResponseDto {
  id: number
  idCita: number
  idServicio: number
  nombreServicio: string
  duracionMin: number
  precio: number
  fechaHoraInicioPlanCita: string
  fechaHoraFinPlanCita: string
  subTotalCita: number
  totalFinalCita: number
}

export interface CreateCitaServicioDto {
  idCita: number
  idServicio: number
  duracionMin?: number
  precio?: number
}
