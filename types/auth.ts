// types/auth.ts

export interface LoginDto {
  correo: string;
  clave: string;
}

export interface UsuarioResponseDto {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: string;
  activo: boolean;
  idClinica: number;
  nombreClinica?: string;
  fechaCreacion: string; // DateTime → string JSON
}

export interface AuthResponseDto {
  exito: boolean;
  mensaje: string;
  usuario?: UsuarioResponseDto;
}