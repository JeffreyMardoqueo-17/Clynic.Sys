export type EstadoCita = 1 | 2 | 3 | 4

export interface CitaServicioDetalleDto {
  idServicio: number
  nombreServicio: string
  duracionMin: number
  precio: number
}

export interface ConsultaMedicaResponseDto {
  id: number
  idCita: number
  idPaciente: number
  idDoctor?: number
  diagnostico: string
  tratamiento: string
  receta: string
  examenesSolicitados: string
  notasMedicas: string
  fechaConsulta: string
}

export interface CitaResponseDto {
  id: number
  idClinica: number
  idSucursal: number
  idPaciente: number
  idDoctor?: number
  nombrePaciente: string
  correoPaciente: string
  telefonoPaciente: string
  fechaHoraInicioPlan: string
  fechaHoraFinPlan: string
  fechaHoraInicioReal?: string
  fechaHoraFinReal?: string
  estado: EstadoCita
  notas: string
  subTotal: number
  totalFinal: number
  fechaCreacion: string
  servicios: CitaServicioDetalleDto[]
  consultaMedica?: ConsultaMedicaResponseDto
}

export interface CreateCitaPublicaDto {
  idClinica: number
  idSucursal: number
  nombres: string
  apellidos: string
  telefono?: string
  correo: string
  fechaHoraInicioPlan: string
  notas?: string
  idsServicios: number[]
}

export interface CreateCitaInternaDto {
  idClinica: number
  idSucursal: number
  idPaciente: number
  idDoctor?: number
  fechaHoraInicioPlan: string
  idsServicios: number[]
  notas?: string
  estadoInicial?: EstadoCita
}

export interface AsignarDoctorCitaDto {
  idDoctor?: number
}

export interface RegistrarConsultaMedicaDto {
  diagnostico: string
  tratamiento?: string
  receta?: string
  examenesSolicitados?: string
  notasMedicas?: string
  fechaConsulta?: string
}

export interface CatalogoSucursalDto {
  id: number
  nombre: string
  direccion: string
}

export interface CatalogoServicioDto {
  id: number
  nombreServicio: string
  duracionMin: number
  precioBase: number
}

export interface CatalogoCitaPublicaDto {
  idClinica: number
  sucursales: CatalogoSucursalDto[]
  servicios: CatalogoServicioDto[]
}
