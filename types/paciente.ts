import { ConsultaMedicaResponseDto } from "@/types/cita"

export interface HistorialClinicoResponseDto {
  id: number
  idPaciente: number
  enfermedadesPrevias: string
  medicamentosActuales: string
  alergias: string
  antecedentesFamiliares: string
  observaciones: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PacienteResponseDto {
  id: number
  idClinica: number
  nombres: string
  apellidos: string
  nombreCompleto: string
  telefono: string
  correo: string
  fechaNacimiento?: string
  fechaRegistro: string
  historialClinico?: HistorialClinicoResponseDto
  consultasRecientes: ConsultaMedicaResponseDto[]
}

export interface UpdatePacienteDto {
  nombres: string
  apellidos: string
  telefono?: string
  correo: string
  fechaNacimiento?: string
}

export interface UpdateHistorialClinicoDto {
  enfermedadesPrevias?: string
  medicamentosActuales?: string
  alergias?: string
  antecedentesFamiliares?: string
  observaciones?: string
}
