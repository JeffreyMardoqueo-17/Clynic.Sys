export interface LandingServiceItemDto {
  titulo: string
  descripcion: string
}

export interface LandingPageConfigResponseDto {
  id: number
  idClinica: number
  nombreLanding: string
  heroTitulo: string
  heroSubtitulo: string
  descripcionGeneral: string
  telefonoContacto: string
  correoContacto: string
  direccionContacto: string
  whatsappContacto: string
  ctaPrincipalTexto: string
  ctaPrincipalUrl: string
  serviciosDestacados: LandingServiceItemDto[]
  metaTitulo: string
  metaDescripcion: string
  dominioBase: string
  mostrarHorariosSucursal: boolean
  publicada: boolean
  fechaActualizacion: string
}

export interface UpsertLandingPageConfigDto {
  idClinica: number
  nombreLanding: string
  heroTitulo: string
  heroSubtitulo: string
  descripcionGeneral: string
  telefonoContacto: string
  correoContacto: string
  direccionContacto: string
  whatsappContacto: string
  ctaPrincipalTexto: string
  ctaPrincipalUrl: string
  serviciosDestacados: LandingServiceItemDto[]
  metaTitulo: string
  metaDescripcion: string
  dominioBase: string
  mostrarHorariosSucursal: boolean
  publicada: boolean
}

export interface LandingHorarioDto {
  diaSemana: number
  horaInicio: string
  horaFin: string
}

export interface LandingServicioClinicaDto {
  id: number
  nombreServicio: string
  precioBase: number
  duracionMin: number
}

export interface LandingPublicResponseDto {
  idClinica: number
  idSucursal: number
  slugClinica: string
  nombreClinica: string
  nombreSucursal: string
  subdominioSucursal: string
  nombreLanding: string
  heroTitulo: string
  heroSubtitulo: string
  descripcionGeneral: string
  telefonoContacto: string
  correoContacto: string
  direccionContacto: string
  whatsappContacto: string
  ctaPrincipalTexto: string
  ctaPrincipalUrl: string
  serviciosDestacados: LandingServiceItemDto[]
  serviciosClinica: LandingServicioClinicaDto[]
  horariosSucursal: LandingHorarioDto[]
  metaTitulo: string
  metaDescripcion: string
}
