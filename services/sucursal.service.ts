import { CreateSucursalDto, SucursalResponseDto } from "@/types/sucursal"
import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"

type RawSucursal = {
  id?: number
  Id?: number
  idClinica?: number
  IdClinica?: number
  nombre?: string
  Nombre?: string
  direccion?: string
  Direccion?: string
  activa?: boolean
  Activa?: boolean
}

function mapSucursal(raw: RawSucursal): SucursalResponseDto {
  return {
    id: raw.id ?? raw.Id ?? 0,
    idClinica: raw.idClinica ?? raw.IdClinica ?? 0,
    nombre: raw.nombre ?? raw.Nombre ?? "",
    direccion: raw.direccion ?? raw.Direccion ?? "",
    activa: raw.activa ?? raw.Activa ?? false,
  }
}

export const sucursalService = {
  async obtenerTodas(): Promise<SucursalResponseDto[]> {
    const response = await fetch(`${getApiUrl()}/Sucursales`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener sucursales"))
    }

    const result = (await response.json()) as RawSucursal[]
    return result.map(mapSucursal)
  },

  async obtenerPorId(id: number): Promise<SucursalResponseDto> {
    const response = await fetch(`${getApiUrl()}/Sucursales/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener sucursal"))
    }

    const result = (await response.json()) as RawSucursal
    return mapSucursal(result)
  },

  async crear(data: CreateSucursalDto): Promise<SucursalResponseDto> {
    const response = await fetch(`${getApiUrl()}/Sucursales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al crear sucursal"))
    }

    const result = (await response.json()) as RawSucursal
    return mapSucursal(result)
  },

  async obtenerPorClinica(idClinica: number): Promise<SucursalResponseDto[]> {
    const sucursales = await this.obtenerTodas()
    return sucursales.filter((s) => s.idClinica === idClinica)
  },
}
