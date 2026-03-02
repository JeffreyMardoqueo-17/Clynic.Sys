import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import {
  DashboardCitasSerieDto,
  DashboardOperativoDto,
  DashboardPeriodo,
  DashboardResumenDto,
} from "@/types/dashboard"

export const dashboardService = {
  async obtenerResumen(options?: { idSucursal?: number }): Promise<DashboardResumenDto> {
    const params = new URLSearchParams()
    if (options?.idSucursal) params.set("idSucursal", String(options.idSucursal))
    const query = params.toString()

    const response = await fetch(`${getApiUrl()}/api/Dashboard/resumen${query ? `?${query}` : ""}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo cargar el resumen del dashboard"))
    }

    return response.json()
  },

  async obtenerCitasPorDia(options?: {
    periodo?: DashboardPeriodo
    fechaDesde?: string
    fechaHasta?: string
    idSucursal?: number
  }): Promise<DashboardCitasSerieDto> {
    const params = new URLSearchParams()

    if (options?.periodo) params.set("periodo", options.periodo)
    if (options?.fechaDesde) params.set("fechaDesde", options.fechaDesde)
    if (options?.fechaHasta) params.set("fechaHasta", options.fechaHasta)
    if (options?.idSucursal) params.set("idSucursal", String(options.idSucursal))

    const query = params.toString()

    const response = await fetch(`${getApiUrl()}/api/Dashboard/citas-por-dia${query ? `?${query}` : ""}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo cargar la serie de citas"))
    }

    return response.json()
  },

  async obtenerOperativo(options?: { idSucursal?: number }): Promise<DashboardOperativoDto> {
    const params = new URLSearchParams()
    if (options?.idSucursal) params.set("idSucursal", String(options.idSucursal))
    const query = params.toString()

    const response = await fetch(`${getApiUrl()}/api/Dashboard/operativo${query ? `?${query}` : ""}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo cargar el operativo del dashboard"))
    }

    return response.json()
  },
}
