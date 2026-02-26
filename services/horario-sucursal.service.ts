import {
  AsuetoSucursalResponseDto,
  CreateAsuetoSucursalDto,
  CreateHorarioSucursalDto,
  HorarioSucursalResponseDto,
  UpdateHorarioSucursalDto,
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

  async actualizar(id: number, data: UpdateHorarioSucursalDto): Promise<HorarioSucursalResponseDto> {
    const response = await fetch(`${getApiUrl()}/HorariosSucursal/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al actualizar horario"))
    }

    return response.json()
  },

  async eliminar(id: number): Promise<void> {
    const response = await fetch(`${getApiUrl()}/HorariosSucursal/${id}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al eliminar horario"))
    }
  },

  async obtenerAsuetosPorSucursal(idSucursal: number): Promise<AsuetoSucursalResponseDto[]> {
    const response = await fetch(`${getApiUrl()}/HorariosSucursal/sucursal/${idSucursal}/asuetos`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener asuetos de la sucursal"))
    }

    return response.json()
  },

  async crearAsueto(data: CreateAsuetoSucursalDto): Promise<AsuetoSucursalResponseDto> {
    const response = await fetch(`${getApiUrl()}/HorariosSucursal/asuetos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al crear asueto"))
    }

    return response.json()
  },

  async eliminarAsueto(id: number): Promise<void> {
    const response = await fetch(`${getApiUrl()}/HorariosSucursal/asuetos/${id}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al eliminar asueto"))
    }
  },
}
