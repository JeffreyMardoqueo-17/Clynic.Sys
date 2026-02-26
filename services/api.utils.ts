const API_URL = process.env.NEXT_PUBLIC_API_URL

type ApiError = {
  mensaje?: string
  message?: string
  detail?: string
  title?: string
  error?: string
  errors?: string[] | Record<string, string[]>
}

export function getApiUrl() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL no está configurada")
  }

  return API_URL
}

export async function getApiErrorMessage(
  response: Response,
  fallbackMessage: string
) {
  try {
    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) {
      return fallbackMessage
    }

    const result = (await response.json()) as ApiError

    if (result?.mensaje) return result.mensaje
    if (result?.message && Array.isArray(result.errors) && result.errors.length > 0) {
      return `${result.message} ${result.errors.join(" | ")}`
    }
    if (result?.message) return result.message

    if (result?.errors) {
      if (Array.isArray(result.errors) && result.errors.length > 0) {
        return result.errors.join(" | ")
      }

      const flat = Object.values(result.errors)
        .flat()
        .filter(Boolean)

      if (flat.length > 0) {
        return flat.join(" | ")
      }
    }

    if (result?.detail) return result.detail
    if (result?.title) return result.title
    if (result?.error) return result.error

    return fallbackMessage
  } catch {
    return fallbackMessage
  }
}
