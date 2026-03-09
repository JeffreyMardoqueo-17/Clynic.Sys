import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import { CitaServicioResponseDto, CreateCitaServicioDto } from "@/types/cita-servicio"

export const citaServicioService = {
  async obtenerPorCita(idCita: number): Promise<CitaServicioResponseDto[]> {
    const response = await fetch(`${getApiUrl()}/api/CitaServicios/cita/${idCita}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo cargar el detalle de servicios de la cita"))
    }

    return response.json()
  },

  async crear(data: CreateCitaServicioDto): Promise<CitaServicioResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/CitaServicios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo agregar el servicio a la cita"))
    }

    return response.json()
  },

  async eliminar(idCitaServicio: number): Promise<void> {
    const response = await fetch(`${getApiUrl()}/api/CitaServicios/${idCitaServicio}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo eliminar el servicio de la cita"))
    }
  },
}
