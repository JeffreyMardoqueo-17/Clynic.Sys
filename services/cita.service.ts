import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import {
  AsignarDoctorCitaDto,
  CambiarEstadoCitaDto,
  CatalogoCitaPublicaDto,
  HorariosDisponiblesCitaDto,
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

  async obtenerHorariosDisponiblesPublicos(params: {
    idClinica: number
    idSucursal: number
    idEspecialidad: number
    fecha: string
    idsServicios: number[]
    intervaloMin?: number
  }): Promise<HorariosDisponiblesCitaDto> {
    const query = new URLSearchParams()
    query.set("idClinica", String(params.idClinica))
    query.set("idSucursal", String(params.idSucursal))
    query.set("idEspecialidad", String(params.idEspecialidad))
    query.set("fecha", params.fecha)
    if (params.intervaloMin && params.intervaloMin > 0) {
      query.set("intervaloMin", String(params.intervaloMin))
    }

    for (const idServicio of params.idsServicios) {
      query.append("idsServicios", String(idServicio))
    }

    const response = await fetch(`${getApiUrl()}/api/Citas/publica/horarios-disponibles?${query.toString()}`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo consultar la disponibilidad de horarios"))
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

  async obtenerColaDoctor(): Promise<CitaResponseDto[]> {
    const response = await fetch(`${getApiUrl()}/api/Citas/doctor/cola`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo cargar la cola del doctor"))
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

  async cambiarEstado(idCita: number, data: CambiarEstadoCitaDto): Promise<CitaResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/Citas/${idCita}/estado`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo cambiar el estado de la cita"))
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
