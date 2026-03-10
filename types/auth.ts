// types/auth.ts

export interface LoginDto {
  correo: string;
  clave: string;
}

export interface RegisterDto {
  nombreCompleto: string;
  correo: string;
  clave: string;
  idClinica: number;
  idSucursal?: number;
  idRol: number;
  rol?: number;
  idEspecialidad?: number;
}

export interface RegisterClinicDto {
  nombreClinica: string;
  telefonoClinica: string;
  direccionClinica: string;
  nombreCompleto: string;
  correo: string;
  clave: string;
}

export interface RolDto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  idClinica?: number | null;
  idSucursal?: number | null;
}

export interface CreateRolDto {
  idClinica: number;
  idSucursal: number;
  nombre: string;
  descripcion?: string;
}

export interface EspecialidadDto {
  id: number;
  idClinica?: number | null;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

export interface EspecialidadSucursalDto {
  id: number;
  idSucursal: number;
  idEspecialidad: number;
  nombreEspecialidad: string;
  activa: boolean;
}

export interface CreateEspecialidadDto {
  idClinica: number;
  nombre: string;
  descripcion?: string;
}

export interface AsignarEspecialidadDoctorSucursalesDto {
  idClinica: number;
  idEspecialidad: number;
  idsSucursales: number[];
}

export interface ActualizarEstadoEspecialidadDoctorSucursalesDto {
  idClinica: number;
  idEspecialidad: number;
  idsSucursales: number[];
  activa: boolean;
}

export interface ForgotPasswordDto {
  correo: string;
}

export interface ResetPasswordDto {
  correo: string;
  codigo: string;
  nuevaClave: string;
  confirmarClave: string;
}

export interface ChangePasswordDto {
  claveActual: string;
  nuevaClave: string;
  confirmarClave: string;
}

export interface UsuarioResponseDto {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol?: string | number;
  idRol?: number;
  nombreRol?: string;
  idEspecialidad?: number;
  nombreEspecialidad?: string;
  activo: boolean;
  debeCambiarClave?: boolean;
  idClinica: number;
  nombreClinica?: string;
  idSucursal?: number;
  nombreSucursal?: string;
  fechaCreacion: string; // DateTime → string JSON
}

export interface AuthResponseDto {
  exito: boolean;
  mensaje: string;
  token?: string;
  expiracion?: string;
  usuario?: UsuarioResponseDto;
}