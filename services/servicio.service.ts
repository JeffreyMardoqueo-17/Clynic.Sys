import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import { CapacidadEspecialidadDiaDto, CreateServicioDto, ServicioResponseDto, UpdateServicioDto } from "@/types/servicio"

type RawServicio = {
  id?: number
  Id?: number
  idClinica?: number
  IdClinica?: number
  idEspecialidad?: number
  IdEspecialidad?: number
  nombreEspecialidad?: string
  NombreEspecialidad?: string
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
    idEspecialidad: raw.idEspecialidad ?? raw.IdEspecialidad ?? 0,
    nombreEspecialidad: raw.nombreEspecialidad ?? raw.NombreEspecialidad ?? "",
    nombreServicio: raw.nombreServicio ?? raw.NombreServicio ?? "",
    duracionMin: raw.duracionMin ?? raw.DuracionMin ?? 0,
    precioBase: raw.precioBase ?? raw.PrecioBase ?? 0,
    activo: raw.activo ?? raw.Activo ?? false,
  }
}

type RawCapacidadEspecialidadDia = {
  fecha?: string
  Fecha?: string
  idEspecialidad?: number
  IdEspecialidad?: number
  nombreEspecialidad?: string
  NombreEspecialidad?: string
  totalCitasAgendadas?: number
  TotalCitasAgendadas?: number
  totalMinutosAgendados?: number
  TotalMinutosAgendados?: number
  duracionPromedioCitaMin?: number
  DuracionPromedioCitaMin?: number
  minutosLaborablesDia?: number
  MinutosLaborablesDia?: number
  minutosDisponiblesDia?: number
  MinutosDisponiblesDia?: number
  citasPosiblesDia?: number
  CitasPosiblesDia?: number
  citasDisponiblesDia?: number
  CitasDisponiblesDia?: number
  saturacionPct?: number
  SaturacionPct?: number
}

function mapCapacidad(raw: RawCapacidadEspecialidadDia): CapacidadEspecialidadDiaDto {
  return {
    fecha: raw.fecha ?? raw.Fecha ?? "",
    idEspecialidad: raw.idEspecialidad ?? raw.IdEspecialidad ?? 0,
    nombreEspecialidad: raw.nombreEspecialidad ?? raw.NombreEspecialidad ?? "",
    totalCitasAgendadas: raw.totalCitasAgendadas ?? raw.TotalCitasAgendadas ?? 0,
    totalMinutosAgendados: raw.totalMinutosAgendados ?? raw.TotalMinutosAgendados ?? 0,
    duracionPromedioCitaMin: raw.duracionPromedioCitaMin ?? raw.DuracionPromedioCitaMin ?? 0,
    minutosLaborablesDia: raw.minutosLaborablesDia ?? raw.MinutosLaborablesDia ?? 0,
    minutosDisponiblesDia: raw.minutosDisponiblesDia ?? raw.MinutosDisponiblesDia ?? 0,
    citasPosiblesDia: raw.citasPosiblesDia ?? raw.CitasPosiblesDia ?? 0,
    citasDisponiblesDia: raw.citasDisponiblesDia ?? raw.CitasDisponiblesDia ?? 0,
    saturacionPct: raw.saturacionPct ?? raw.SaturacionPct ?? 0,
  }
}

export const servicioService = {
  async obtenerCapacidadPorEspecialidad(
    idClinica: number,
    options: {
      fechaDesde: string
      fechaHasta: string
      idSucursal?: number
      horasLaborablesDia?: number
      minutosAlmuerzoDia?: number
    }
  ): Promise<CapacidadEspecialidadDiaDto[]> {
    const params = new URLSearchParams()
    params.set("fechaDesde", options.fechaDesde)
    params.set("fechaHasta", options.fechaHasta)

    if (options.idSucursal && options.idSucursal > 0) {
      params.set("idSucursal", String(options.idSucursal))
    }

    if (typeof options.horasLaborablesDia === "number") {
      params.set("horasLaborablesDia", String(options.horasLaborablesDia))
    }

    if (typeof options.minutosAlmuerzoDia === "number") {
      params.set("minutosAlmuerzoDia", String(options.minutosAlmuerzoDia))
    }

    const response = await fetch(
      `${getApiUrl()}/api/Servicios/clinica/${idClinica}/capacidad-especialidad?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    )

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener capacidad por especialidad"))
    }

    const result = (await response.json()) as RawCapacidadEspecialidadDia[]
    return result.map(mapCapacidad)
  },

  async obtenerPublicosPorClinica(
    idClinica: number,
    options?: { nombre?: string }
  ): Promise<ServicioResponseDto[]> {
    const params = new URLSearchParams()

    if (options?.nombre?.trim()) {
      params.set("nombre", options.nombre.trim())
    }

    const response = await fetch(
      `${getApiUrl()}/api/Servicios/publicos/clinica/${idClinica}${params.toString() ? `?${params.toString()}` : ""}`,
      {
        method: "GET",
        cache: "no-store",
      }
    )

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Error al obtener servicios públicos"))
    }

    const result = (await response.json()) as RawServicio[]
    return result.map(mapServicio)
  },

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
