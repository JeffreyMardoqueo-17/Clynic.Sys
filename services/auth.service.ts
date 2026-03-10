// services/auth.service.ts

import {
  LoginDto,
  RegisterDto,
  RegisterClinicDto,
  AuthResponseDto,
  UsuarioResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RolDto,
  CreateRolDto,
  EspecialidadDto,
  EspecialidadSucursalDto,
  CreateEspecialidadDto,
  ActualizarEstadoEspecialidadDoctorSucursalesDto,
  AsignarEspecialidadDoctorSucursalesDto,
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

  async register(data: RegisterDto): Promise<AuthResponseDto> {
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

  async registerClinic(data: RegisterClinicDto): Promise<AuthResponseDto> {
    const response = await fetch(`${getApiUrl()}/auth/register-clinic`, {
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
      mensaje: "Error al registrar clínica",
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
          (await getApiErrorMessage(responseClone, "Error al registrar clínica"))
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

    const raw = (await response.json()) as UsuarioResponseDto;

    return {
      ...raw,
      rol: raw.nombreRol ?? raw.rol ?? raw.idRol,
    };
  },

  async GetProfile(): Promise<UsuarioResponseDto> {
    return this.getProfile();
  },

  async getRolesBySucursal(idClinica: number, idSucursal: number): Promise<RolDto[]> {
    const response = await fetch(`${getApiUrl()}/api/CatalogoPersonal/roles/clinica/${idClinica}/sucursal/${idSucursal}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudieron obtener los roles de la sucursal"));
    }

    return (await response.json()) as RolDto[];
  },

  async createRol(data: CreateRolDto): Promise<RolDto> {
    const response = await fetch(`${getApiUrl()}/api/CatalogoPersonal/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo crear el rol"));
    }

    return (await response.json()) as RolDto;
  },

  async getEspecialidadesByClinica(idClinica: number): Promise<EspecialidadDto[]> {
    const response = await fetch(`${getApiUrl()}/api/CatalogoPersonal/especialidades/clinica/${idClinica}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudieron obtener las especialidades de la clínica"));
    }

    return (await response.json()) as EspecialidadDto[];
  },

  async getEspecialidadesBySucursal(idClinica: number, idSucursal: number): Promise<EspecialidadSucursalDto[]> {
    const response = await fetch(`${getApiUrl()}/api/CatalogoPersonal/especialidades/clinica/${idClinica}/sucursal/${idSucursal}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudieron obtener las especialidades de la sucursal"));
    }

    return (await response.json()) as EspecialidadSucursalDto[];
  },

    async getDoctorEspecialidadesByClinica(idClinica: number): Promise<EspecialidadDto[]> {
      const response = await fetch(`${getApiUrl()}/api/EspecialidadesDoctor/clinica/${idClinica}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "No se pudieron obtener las especialidades de doctor por clínica"));
      }

      return (await response.json()) as EspecialidadDto[];
    },

    async getDoctorEspecialidadesBySucursal(idClinica: number, idSucursal: number): Promise<EspecialidadSucursalDto[]> {
      const response = await fetch(`${getApiUrl()}/api/EspecialidadesDoctor/clinica/${idClinica}/sucursal/${idSucursal}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "No se pudieron obtener las especialidades de doctor por sucursal"));
      }

      return (await response.json()) as EspecialidadSucursalDto[];
    },

    async createDoctorEspecialidad(data: CreateEspecialidadDto): Promise<EspecialidadDto> {
      const response = await fetch(`${getApiUrl()}/api/EspecialidadesDoctor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "No se pudo crear la especialidad de doctor"));
      }

      return (await response.json()) as EspecialidadDto;
    },

    async asignarDoctorEspecialidadASucursales(
      data: AsignarEspecialidadDoctorSucursalesDto
    ): Promise<EspecialidadSucursalDto[]> {
      const response = await fetch(`${getApiUrl()}/api/EspecialidadesDoctor/asignar-sucursales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "No se pudo asignar la especialidad a las sucursales"));
      }

      return (await response.json()) as EspecialidadSucursalDto[];
    },

    async actualizarEstadoEspecialidadEnSucursales(
      payload: ActualizarEstadoEspecialidadDoctorSucursalesDto
    ): Promise<string> {
      const response = await fetch(`${getApiUrl()}/api/EspecialidadesDoctor/estado-sucursales`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = (await response.json().catch(() => ({}))) as ApiMessageResponse;
      if (!response.ok) {
        throw new Error(result.mensaje || result.message || (await getApiErrorMessage(response, "No se pudo actualizar el estado de especialidades")));
      }

      return result.mensaje || result.message || "Estado actualizado correctamente";
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