import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import {
  HistorialClinicoResponseDto,
  PacienteResponseDto,
  UpdateHistorialClinicoDto,
  UpdatePacienteDto,
} from "@/types/paciente"

export const pacienteService = {
  async obtenerPorClinica(idClinica: number, busqueda?: string): Promise<PacienteResponseDto[]> {
    const params = new URLSearchParams()
    if (busqueda?.trim()) {
      params.set("busqueda", busqueda.trim())
    }

    const response = await fetch(
      `${getApiUrl()}/api/Pacientes/clinica/${idClinica}${params.toString() ? `?${params.toString()}` : ""}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    )

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudieron cargar los pacientes"))
    }

    return response.json()
  },

  async actualizar(idPaciente: number, data: UpdatePacienteDto): Promise<PacienteResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Pacientes/${idPaciente}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo actualizar el paciente"))
    }

    return response.json()
  },

  async guardarHistorial(idPaciente: number, data: UpdateHistorialClinicoDto): Promise<HistorialClinicoResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Pacientes/${idPaciente}/historial`, {
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
