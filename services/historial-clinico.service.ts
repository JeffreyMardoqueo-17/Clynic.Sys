import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import { HistorialClinicoResponseDto, UpsertHistorialClinicoDto } from "@/types/historial-clinico"

export const historialClinicoService = {
  async obtenerPorPaciente(idPaciente: number): Promise<HistorialClinicoResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/HistorialesClinicos/paciente/${idPaciente}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo cargar el historial clínico"))
    }

    return response.json()
  },

  async guardar(idPaciente: number, data: UpsertHistorialClinicoDto): Promise<HistorialClinicoResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/HistorialesClinicos/paciente/${idPaciente}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo guardar el historial clínico"))
    }

    return response.json()
  },
}
