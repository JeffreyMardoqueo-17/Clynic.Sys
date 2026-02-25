import { NextResponse, type NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

function isAuthPath(pathname: string) {
  return pathname.startsWith("/auth")
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const authPath = isAuthPath(pathname)

  if (!API_URL) {
    if (authPath) {
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
      if (authPath) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      return NextResponse.next()
    }
  } catch {
    // ignored
  }

  if (authPath) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/auth/login", request.url)
  loginUrl.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
