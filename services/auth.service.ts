// services/auth.service.ts

import { LoginDto, AuthResponseDto, UsuarioResponseDto } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiErrorResponse = {
  mensaje?: string;
};

function getApiUrl() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL no está configurada");
  }

  return API_URL;
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const errorResult: ApiErrorResponse = await response.json();
      return errorResult?.mensaje || fallbackMessage;
    }
  } catch {
    // ignored
  }

  return fallbackMessage;
}

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

    let result: AuthResponseDto = {
      exito: false,
      mensaje: "Error en el login",
    };

    try {
      result = (await response.json()) as AuthResponseDto;
    } catch {
      // ignored
    }

    if (!response.ok) {
      throw new Error(result.mensaje || "Error en el login");
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

    let result: AuthResponseDto = {
      exito: false,
      mensaje: "Error en el registro",
    };

    try {
      result = (await response.json()) as AuthResponseDto;
    } catch {
      // ignored
    }

    if (!response.ok) {
      throw new Error(result.mensaje || "Error en el registro");
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
      throw new Error(await readErrorMessage(response, "Error al obtener el perfil"));
    }

    return response.json();
  },

  async GetProfile(): Promise<UsuarioResponseDto> {
    return this.getProfile();
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