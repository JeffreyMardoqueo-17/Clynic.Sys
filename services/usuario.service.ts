import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import { CreateTrabajadorDto, UpdateTrabajadorDto, UsuarioResponseDto } from "@/types/usuario"

type RawUsuario = {
  id?: number
  Id?: number
  nombreCompleto?: string
  NombreCompleto?: string
  correo?: string
  Correo?: string
  rol?: number
  Rol?: number
  activo?: boolean
  Activo?: boolean
  debeCambiarClave?: boolean
  DebeCambiarClave?: boolean
  idClinica?: number
  IdClinica?: number
  idSucursal?: number | null
  IdSucursal?: number | null
  nombreClinica?: string
  NombreClinica?: string
  nombreSucursal?: string | null
  NombreSucursal?: string | null
  fechaCreacion?: string
  FechaCreacion?: string
}

function mapUsuario(raw: RawUsuario): UsuarioResponseDto {
  return {
    id: raw.id ?? raw.Id ?? 0,
    nombreCompleto: raw.nombreCompleto ?? raw.NombreCompleto ?? "",
    correo: raw.correo ?? raw.Correo ?? "",
    rol: (raw.rol ?? raw.Rol ?? 2) as 1 | 2 | 3,
    activo: raw.activo ?? raw.Activo ?? false,
    debeCambiarClave: raw.debeCambiarClave ?? raw.DebeCambiarClave ?? false,
    idClinica: raw.idClinica ?? raw.IdClinica ?? 0,
    idSucursal: raw.idSucursal ?? raw.IdSucursal ?? undefined,
    nombreClinica: raw.nombreClinica ?? raw.NombreClinica,
    nombreSucursal: raw.nombreSucursal ?? raw.NombreSucursal ?? undefined,
    fechaCreacion: raw.fechaCreacion ?? raw.FechaCreacion ?? "",
  }
}

export const usuarioService = {
  async obtenerPorClinica(idClinica: number, nombre?: string): Promise<UsuarioResponseDto[]> {
    const params = new URLSearchParams()
    if (nombre?.trim()) {
      params.set("nombre", nombre.trim())
    }

    const response = await fetch(`${getApiUrl()}/api/Usuarios/clinica/${idClinica}${params.toString() ? `?${params.toString()}` : ""}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener trabajadores"))
    }

    const result = (await response.json()) as RawUsuario[]
    return result.map(mapUsuario)
  },

  async crear(data: CreateTrabajadorDto): Promise<UsuarioResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al crear trabajador"))
    }

    const result = (await response.json()) as RawUsuario
    return mapUsuario(result)
  },

  async obtenerPorClinicaYSucursal(idClinica: number, idSucursal: number, nombre?: string): Promise<UsuarioResponseDto[]> {
    const params = new URLSearchParams()
    if (nombre?.trim()) {
      params.set("nombre", nombre.trim())
    }

    const response = await fetch(`${getApiUrl()}/api/Usuarios/clinica/${idClinica}/sucursal/${idSucursal}${params.toString() ? `?${params.toString()}` : ""}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener trabajadores por sucursal"))
    }

    const result = (await response.json()) as RawUsuario[]
    return result.map(mapUsuario)
  },

  async obtenerInactivosPorClinica(idClinica: number, idSucursal?: number, nombre?: string): Promise<UsuarioResponseDto[]> {
    const params = new URLSearchParams()
    if (idSucursal && idSucursal > 0) {
      params.set("idSucursal", String(idSucursal))
    }
    if (nombre?.trim()) {
      params.set("nombre", nombre.trim())
    }

    const response = await fetch(`${getApiUrl()}/api/Usuarios/clinica/${idClinica}/inactivos${params.toString() ? `?${params.toString()}` : ""}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener trabajadores inactivos"))
    }

    const result = (await response.json()) as RawUsuario[]
    return result.map(mapUsuario)
  },

  async actualizar(id: number, data: UpdateTrabajadorDto): Promise<UsuarioResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Usuarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al actualizar trabajador"))
    }

    const result = (await response.json()) as RawUsuario
    return mapUsuario(result)
  },

  async eliminar(id: number): Promise<void> {
    const response = await fetch(`${getApiUrl()}/api/Usuarios/${id}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al eliminar trabajador"))
    }
  },
}
