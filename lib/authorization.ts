export type AppRole = "Admin" | "Doctor" | "Recepcionista" | "Unknown"

export function normalizeRole(role: unknown): AppRole {
  if (role === null || role === undefined) return "Unknown"

  const raw = String(role).trim().toLowerCase()

  if (raw === "1" || raw === "admin") return "Admin"
  if (raw === "2" || raw === "doctor") return "Doctor"
  if (raw === "3" || raw === "recepcionista") return "Recepcionista"

  return "Unknown"
}

const routeRules: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/agendar-cita", roles: ["Admin", "Doctor", "Recepcionista"] },
  { prefix: "/doctors", roles: ["Admin"] },
  { prefix: "/branches", roles: ["Admin"] },
  { prefix: "/services", roles: ["Admin"] },
  { prefix: "/billing", roles: ["Admin"] },
  { prefix: "/reports", roles: ["Admin"] },
  { prefix: "/settings", roles: ["Admin"] },

  { prefix: "/records", roles: ["Admin", "Doctor"] },

  { prefix: "/appointment", roles: ["Admin", "Doctor", "Recepcionista"] },
  { prefix: "/patients", roles: ["Admin", "Doctor", "Recepcionista"] },
  { prefix: "/clinic", roles: ["Admin", "Doctor", "Recepcionista"] },
  { prefix: "/profile", roles: ["Admin", "Doctor", "Recepcionista"] },
  { prefix: "/help", roles: ["Admin", "Doctor", "Recepcionista"] },
  { prefix: "/401", roles: ["Admin", "Doctor", "Recepcionista"] },
  { prefix: "/", roles: ["Admin", "Doctor", "Recepcionista"] },
]

export function canAccessPath(role: AppRole, pathname: string): boolean {
  if (role === "Unknown") return false

  const match = routeRules.find((rule) =>
    pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  )

  if (!match) return false

  return match.roles.includes(role)
}
