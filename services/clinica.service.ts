import { ClinicaResponseDto, CreateClinicaDto } from "@/types/clinica"
import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"

type RawClinica = {
  id?: number
  Id?: number
  nombre?: string
  Nombre?: string
  telefono?: string
  Telefono?: string
  direccion?: string
  Direccion?: string
  activa?: boolean
  Activa?: boolean
  fechaCreacion?: string
  FechaCreacion?: string
}

function mapClinica(raw: RawClinica): ClinicaResponseDto {
  return {
    id: raw.id ?? raw.Id ?? 0,
    nombre: raw.nombre ?? raw.Nombre ?? "",
    telefono: raw.telefono ?? raw.Telefono ?? "",
    direccion: raw.direccion ?? raw.Direccion ?? "",
    activa: raw.activa ?? raw.Activa ?? false,
    fechaCreacion: raw.fechaCreacion ?? raw.FechaCreacion ?? "",
  }
}

export const clinicaService = {
  async obtenerTodas(): Promise<ClinicaResponseDto[]> {
    const response = await fetch(`${getApiUrl()}/Clinicas`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener clínicas"))
    }

    const result = (await response.json()) as RawClinica[]
    return result.map(mapClinica)
  },

  async obtenerPorId(id: number): Promise<ClinicaResponseDto> {
    const response = await fetch(`${getApiUrl()}/Clinicas/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener la clínica"))
    }

    const result = (await response.json()) as RawClinica
    return mapClinica(result)
  },

  async crear(data: CreateClinicaDto): Promise<ClinicaResponseDto> {
    const response = await fetch(`${getApiUrl()}/Clinicas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al crear clínica"))
    }

    const result = (await response.json()) as RawClinica
    return mapClinica(result)
  },
}
