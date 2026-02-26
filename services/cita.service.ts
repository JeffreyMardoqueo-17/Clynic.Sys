import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import {
  AsignarDoctorCitaDto,
  CatalogoCitaPublicaDto,
  CitaResponseDto,
  CreateCitaInternaDto,
  CreateCitaPublicaDto,
  EstadoCita,
  RegistrarConsultaMedicaDto,
  ConsultaMedicaResponseDto,
} from "@/types/cita"

export const citaService = {
  async obtenerCatalogoPublico(idClinica: number): Promise<CatalogoCitaPublicaDto> {
    const response = await fetch(`${getApiUrl()}/api/Citas/publica/catalogo/${idClinica}`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo cargar el catálogo público"))
    }

    return response.json()
  },

  async crearPublica(data: CreateCitaPublicaDto): Promise<CitaResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Citas/publica`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo agendar la cita"))
    }

    return response.json()
  },

  async crearInterna(data: CreateCitaInternaDto): Promise<CitaResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Citas/interna`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo crear la cita"))
    }

    return response.json()
  },

  async obtenerPorClinica(
    idClinica: number,
    options?: {
      fechaDesde?: string
      fechaHasta?: string
      idSucursal?: number
      estado?: EstadoCita
    }
  ): Promise<CitaResponseDto[]> {
    const params = new URLSearchParams()

    if (options?.fechaDesde) params.set("fechaDesde", options.fechaDesde)
    if (options?.fechaHasta) params.set("fechaHasta", options.fechaHasta)
    if (options?.idSucursal) params.set("idSucursal", String(options.idSucursal))
    if (options?.estado) params.set("estado", String(options.estado))

    const query = params.toString()
    const response = await fetch(
      `${getApiUrl()}/api/Citas/clinica/${idClinica}${query ? `?${query}` : ""}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    )

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudieron cargar las citas"))
    }

    return response.json()
  },

  async asignarDoctor(idCita: number, data: AsignarDoctorCitaDto): Promise<CitaResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Citas/${idCita}/doctor`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo asignar el doctor"))
    }

    return response.json()
  },

  async registrarConsulta(idCita: number, data: RegistrarConsultaMedicaDto): Promise<ConsultaMedicaResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Citas/${idCita}/consulta`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo registrar la consulta"))
    }

    return response.json()
  },
}
