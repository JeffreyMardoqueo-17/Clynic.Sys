import { getApiErrorMessage, getApiUrl } from "@/services/api.utils"
import type {
  LandingPageConfigResponseDto,
  LandingPublicResponseDto,
  UpsertLandingPageConfigDto,
} from "@/types/landing-page"

export const landingPageService = {
  async obtenerPorClinica(idClinica: number): Promise<LandingPageConfigResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/LandingPages/clinica/${idClinica}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo obtener la configuración de landing"))
    }

    return (await response.json()) as LandingPageConfigResponseDto
  },

  async guardar(idClinica: number, payload: UpsertLandingPageConfigDto): Promise<LandingPageConfigResponseDto> {
    const response = await fetch(`${getApiUrl()}/api/LandingPages/clinica/${idClinica}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo guardar la landing"))
    }

    return (await response.json()) as LandingPageConfigResponseDto
  },

  async obtenerPublica(clinicaSlug: string): Promise<LandingPublicResponseDto> {
    const query = new URLSearchParams({ clinicaSlug })

    const response = await fetch(`${getApiUrl()}/api/LandingPages/public?${query.toString()}`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "No se pudo cargar la landing pública"))
    }

    return (await response.json()) as LandingPublicResponseDto
  },
}
