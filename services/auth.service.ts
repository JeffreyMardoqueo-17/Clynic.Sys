// services/auth.service.ts

import { LoginDto, AuthResponseDto } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // importante al usar cookies httpOnly
    });

    const result: AuthResponseDto = await response.json();

    if (!response.ok) {
      throw new Error(result.mensaje || "Error en el login");
    }

    return result;
  },

  async register(data: any): Promise<AuthResponseDto> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result: AuthResponseDto = await response.json();

    if (!response.ok) {
      throw new Error(result.mensaje || "Error en el registro");
    }

    return result;
  },
};