export type DashboardPeriodo = "semanal" | "mensual" | "anual" | "todo"

export interface DashboardResumenDto {
  totalPacientes: number
  totalCitasHoy: number
  totalTrabajadores: number
  totalSucursales: number
  fechaCorte: string
}

export interface DashboardCitasPorDiaDto {
  fecha: string
  totalCitas: number
}

export interface DashboardCitasSerieDto {
  fechaMinima: string
  fechaDesde: string
  fechaHasta: string
  totalPeriodo: number
  serie: DashboardCitasPorDiaDto[]
}

export interface DashboardCitaPendienteDto {
  idCita: number
  idSucursal: number
  nombrePaciente: string
  fechaHoraInicioPlan: string
  fechaHoraFinPlan: string
  estado: string
}

export interface DashboardOperativoDto {
  totalPacientes: number
  totalCitasHoy: number
  totalCitasPendientes: number
  totalTrabajadores: number
  filtradoPorSucursal: boolean
  idSucursal?: number
  pendientes: DashboardCitaPendienteDto[]
}
