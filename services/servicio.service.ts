import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import { CreateServicioDto, ServicioResponseDto, UpdateServicioDto } from "@/types/servicio"

type RawServicio = {
  id?: number
  Id?: number
  idClinica?: number
  IdClinica?: number
  nombreServicio?: string
  NombreServicio?: string
  duracionMin?: number
  DuracionMin?: number
  precioBase?: number
  PrecioBase?: number
  activo?: boolean
  Activo?: boolean
}

function mapServicio(raw: RawServicio): ServicioResponseDto {
  return {
    id: raw.id ?? raw.Id ?? 0,
    idClinica: raw.idClinica ?? raw.IdClinica ?? 0,
    nombreServicio: raw.nombreServicio ?? raw.NombreServicio ?? "",
    duracionMin: raw.duracionMin ?? raw.DuracionMin ?? 0,
    precioBase: raw.precioBase ?? raw.PrecioBase ?? 0,
    activo: raw.activo ?? raw.Activo ?? false,
  }
}

export const servicioService = {
  async obtenerPorClinica(
    idClinica: number,
    options?: { nombre?: string; incluirInactivos?: boolean }
  ): Promise<ServicioResponseDto[]> {
    const params = new URLSearchParams()

    if (options?.nombre?.trim()) {
      params.set("nombre", options.nombre.trim())
    }

    if (options?.incluirInactivos) {
      params.set("incluirInactivos", "true")
    }

    const response = await fetch(
      `${getApiUrl()}/api/Servicios/clinica/${idClinica}${params.toString() ? `?${params.toString()}` : ""}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    )

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener servicios"))
    }

    const result = (await response.json()) as RawServicio[]
    return result.map(mapServicio)
  },

  async crear(data: CreateServicioDto): Promise<ServicioResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Servicios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al crear servicio"))
    }

    const result = (await response.json()) as RawServicio
    return mapServicio(result)
  },

  async actualizar(id: number, data: UpdateServicioDto): Promise<ServicioResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Servicios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al actualizar servicio"))
    }

    const result = (await response.json()) as RawServicio
    return mapServicio(result)
  },

  async eliminar(id: number): Promise<void> {
    const response = await fetch(`${getApiUrl()}/api/Servicios/${id}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al desactivar servicio"))
    }
  },
}
