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
  rol: 1 | 2 | 3;
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
  rol: string;
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
  usuario?: UsuarioResponseDto;
}