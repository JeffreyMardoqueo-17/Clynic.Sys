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

export interface UpsertHistorialClinicoDto {
  enfermedadesPrevias?: string
  medicamentosActuales?: string
  alergias?: string
  antecedentesFamiliares?: string
  observaciones?: string
}
