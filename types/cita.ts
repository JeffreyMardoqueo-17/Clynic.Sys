export type EstadoCita = 1 | 2 | 3 | 4 | 5 | 6

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
  idEspecialidad: number
  nombreEspecialidad: string
  idDoctor?: number
  nombrePaciente: string
  correoPaciente: string
  telefonoPaciente: string
  fechaHoraInicioPlan: string
  fechaHoraFinPlan: string
  duracionEstimadaMin: number
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
  idEspecialidad: number
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
  idEspecialidad: number
  idDoctor?: number
  fechaHoraInicioPlan: string
  idsServicios: number[]
  notas?: string
  estadoInicial?: EstadoCita
}

export interface AsignarDoctorCitaDto {
  idDoctor?: number
}

export interface CambiarEstadoCitaDto {
  nuevoEstado: EstadoCita
  notasOperacion?: string
}

export interface RegistrarConsultaMedicaDto {
  diagnostico: string
  tratamiento?: string
  receta?: string
  examenesSolicitados?: string
  notasMedicas?: string
  fechaConsulta?: string
}

export interface ReprogramarCitaDto {
  nuevaFechaHoraInicioPlan: string
  motivo?: string
  idDoctor?: number
}

export interface CitaActividadResponseDto {
  id: number
  idCita: number
  idClinica: number
  idSucursal: number
  idUsuario?: number
  rolUsuario: string
  accion: string
  detalle: string
  fechaCreacion: string
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
  especialidadesPorSucursal: CatalogoEspecialidadSucursalDto[]
  servicios: CatalogoServicioDto[]
}

export interface CatalogoEspecialidadSucursalDto {
  idSucursal: number
  idEspecialidad: number
  nombreEspecialidad: string
  descripcionEspecialidad: string
  citasMaximasPorDia: number
}

export interface HorarioDisponibleItemDto {
  fechaHoraInicioPlan: string
  fechaHoraFinPlan: string
  horaLabel: string
}

export interface HorariosDisponiblesCitaDto {
  idClinica: number
  idSucursal: number
  idEspecialidad: number
  fecha: string
  duracionEstimadaMin: number
  intervaloMin: number
  citasMaximasPorDiaEspecialidad: number
  citasOcupadasDiaEspecialidad: number
  horarios: HorarioDisponibleItemDto[]
}
