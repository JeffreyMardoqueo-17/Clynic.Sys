import { NextResponse, type NextRequest } from "next/server"
import { canAccessPath, normalizeRole } from "@/lib/authorization"

const API_URL = process.env.NEXT_PUBLIC_API_URL

function isAuthPath(pathname: string) {
  return pathname.startsWith("/auth")
}

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/agendar-cita" || pathname.startsWith("/agendar-cita/")
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const authPath = isAuthPath(pathname)
  const publicPath = isPublicPath(pathname)

  if (!API_URL) {
    if (authPath || publicPath) {
      return NextResponse.next()
    }

    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    })

    if (response.ok) {
      const profile = (await response.json()) as {
        rol?: string | number
        nombreRol?: string
        idRol?: number
      }

      const role = normalizeRole(profile?.rol ?? profile?.nombreRol ?? profile?.idRol)

      // Allow rendering unauthorized page without re-triggering authorization redirects.
      if (pathname === "/401") {
        return NextResponse.next()
      }

      if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      if (!authPath && !canAccessPath(role, pathname)) {
        return NextResponse.redirect(new URL("/401", request.url))
      }

      if (authPath) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      return NextResponse.next()
    }
  } catch {
    // ignored
  }

  if (authPath || publicPath) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/auth/login", request.url)
  loginUrl.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
