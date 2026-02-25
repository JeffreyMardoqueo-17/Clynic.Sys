import {
  CreateHorarioSucursalDto,
  HorarioSucursalResponseDto,
} from "@/types/horario-sucursal"
import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"

export const horarioSucursalService = {
  async obtenerTodos(): Promise<HorarioSucursalResponseDto[]> {
    const response = await fetch(`${getApiUrl()}/HorariosSucursal`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener horarios"))
    }

    return response.json()
  },

  async obtenerPorId(id: number): Promise<HorarioSucursalResponseDto> {
    const response = await fetch(`${getApiUrl()}/HorariosSucursal/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener horario"))
    }

    return response.json()
  },

  async obtenerPorSucursal(idSucursal: number): Promise<HorarioSucursalResponseDto[]> {
    const response = await fetch(`${getApiUrl()}/HorariosSucursal/sucursal/${idSucursal}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener horarios de la sucursal"))
    }

    return response.json()
  },

  async crear(data: CreateHorarioSucursalDto): Promise<HorarioSucursalResponseDto> {
    const response = await fetch(`${getApiUrl()}/HorariosSucursal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al crear horario"))
    }

    return response.json()
  },
}
