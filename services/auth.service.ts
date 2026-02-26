// services/auth.service.ts

import {
  LoginDto,
  AuthResponseDto,
  UsuarioResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from "@/types/auth";
import { getApiErrorMessage, getApiUrl } from "@/services/api.utils";

type ApiMessageResponse = {
  mensaje?: string;
  message?: string;
};

export const authService = {
  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await fetch(`${getApiUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // importante al usar cookies httpOnly
    });
    const responseClone = response.clone();

    let result: AuthResponseDto = {
      exito: false,
      mensaje: "Error en el login",
    };
    let raw: Record<string, unknown> = {};

    try {
      raw = (await response.json()) as Record<string, unknown>;
      result = raw as unknown as AuthResponseDto;
    } catch {
      // ignored
    }

    if (!response.ok) {
      throw new Error(
        result.mensaje ||
          (typeof raw.message === "string" ? raw.message : "") ||
          (await getApiErrorMessage(responseClone, "Error en el login"))
      );
    }

    return result;
  },

  async register(data: any): Promise<AuthResponseDto> {
    const response = await fetch(`${getApiUrl()}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const responseClone = response.clone();

    let result: AuthResponseDto = {
      exito: false,
      mensaje: "Error en el registro",
    };
    let raw: Record<string, unknown> = {};

    try {
      raw = (await response.json()) as Record<string, unknown>;
      result = raw as unknown as AuthResponseDto;
    } catch {
      // ignored
    }

    if (!response.ok) {
      throw new Error(
        result.mensaje ||
          (typeof raw.message === "string" ? raw.message : "") ||
          (await getApiErrorMessage(responseClone, "Error en el registro"))
      );
    }

    return result;
  },

  async getProfile(): Promise<UsuarioResponseDto> {
    const response = await fetch(`${getApiUrl()}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener el perfil"));
    }

    return response.json();
  },

  async GetProfile(): Promise<UsuarioResponseDto> {
    return this.getProfile();
  },

  async forgotPassword(data: ForgotPasswordDto): Promise<string> {
    const response = await fetch(`${getApiUrl()}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = (await response.json().catch(() => ({}))) as ApiMessageResponse;

    if (!response.ok) {
      throw new Error(result.mensaje || result.message || (await getApiErrorMessage(response, "No se pudo enviar el código de recuperación")));
    }

    return result.mensaje || result.message || "Si el correo existe, recibirás un código de verificación";
  },

  async resetPassword(data: ResetPasswordDto): Promise<string> {
    const response = await fetch(`${getApiUrl()}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = (await response.json().catch(() => ({}))) as ApiMessageResponse;

    if (!response.ok) {
      throw new Error(result.mensaje || result.message || (await getApiErrorMessage(response, "No se pudo restablecer la contraseña")));
    }

    return result.mensaje || result.message || "Contraseña actualizada exitosamente";
  },

  async changePassword(userId: number, data: ChangePasswordDto): Promise<string> {
    const response = await fetch(`${getApiUrl()}/api/Usuarios/${userId}/cambiar-clave`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = (await response.json().catch(() => ({}))) as ApiMessageResponse;

    if (!response.ok) {
      throw new Error(result.mensaje || result.message || (await getApiErrorMessage(response, "No se pudo cambiar la contraseña")));
    }

    return result.mensaje || result.message || "Clave actualizada exitosamente";
  },

  async logout() {
    try {
      await fetch(`${getApiUrl()}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch {
      // ignored
    } finally {
      this.clearSession();
    }
  },

  clearSession() {
    if (typeof window === "undefined") return;
    document.cookie = "clynic_access_token=; path=/; max-age=0; samesite=lax";
  },

};