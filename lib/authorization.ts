export type AppRole = "Admin" | "Doctor" | "Nutricionista" | "Fisioterapeuta" | "Recepcionista" | "Unknown"

export function normalizeRole(role: unknown): AppRole {
  if (role === null || role === undefined) return "Unknown"

  const raw = String(role).trim().toLowerCase()

  if (raw === "1" || raw === "admin") return "Admin"
  if (raw === "2" || raw === "doctor") return "Doctor"
  if (raw === "4" || raw === "nutricionista") return "Nutricionista"
  if (raw === "5" || raw === "fisioterapeuta") return "Fisioterapeuta"
  if (raw === "3" || raw === "recepcionista") return "Recepcionista"

  return "Unknown"
}

const routeRules: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/agendar-cita", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
  { prefix: "/doctors", roles: ["Admin"] },
  { prefix: "/branches", roles: ["Admin"] },
  { prefix: "/services", roles: ["Admin"] },
  { prefix: "/billing", roles: ["Admin"] },
  { prefix: "/reports", roles: ["Admin"] },
  { prefix: "/settings", roles: ["Admin"] },

  { prefix: "/records", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta"] },
  { prefix: "/doctor-panel", roles: ["Doctor", "Nutricionista", "Fisioterapeuta"] },

  { prefix: "/appointment-services", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
  { prefix: "/appointment", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
  { prefix: "/patients", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
  { prefix: "/dashboard", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
  { prefix: "/clinic", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
  { prefix: "/profile", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
  { prefix: "/help", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
  { prefix: "/401", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
  { prefix: "/", roles: ["Admin", "Doctor", "Nutricionista", "Fisioterapeuta", "Recepcionista"] },
]

export function canAccessPath(role: AppRole, pathname: string): boolean {
  if (pathname === "/401" || pathname.startsWith("/401/")) return true

  if (role === "Unknown") return false

  const match = routeRules.find((rule) =>
    pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  )

  if (!match) return false

  return match.roles.includes(role)
}
