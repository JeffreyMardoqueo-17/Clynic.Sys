"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { useState } from "react"

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Building2,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Hospital,
  BriefcaseMedical,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { authService } from "@/services/auth.service"
import { AppRole, normalizeRole } from "@/lib/authorization"

const navItems: Array<{ title: string; url: string; icon: typeof LayoutDashboard; roles: AppRole[] }> = [
  { title: "Home", url: "/", icon: LayoutDashboard, roles: ["Admin", "Doctor", "Recepcionista"] },
  { title: "Mi Clínica", url: "/clinic", icon: Hospital, roles: ["Admin", "Doctor", "Recepcionista"] },
  { title: "Pacientes", url: "/patients", icon: Users, roles: ["Admin", "Doctor", "Recepcionista"] },
  { title: "Citas", url: "/appointment", icon: CalendarDays, roles: ["Admin", "Doctor", "Recepcionista"] },
  { title: "Trabajadores", url: "/doctors", icon: Stethoscope, roles: ["Admin"] },
  { title: "Sucursales", url: "/branches", icon: Building2, roles: ["Admin"] },
  { title: "Servicios", url: "/services", icon: BriefcaseMedical, roles: ["Admin"] },
  { title: "Historial Clínico", url: "/records", icon: FileText, roles: ["Admin", "Doctor"] },
  { title: "Facturación", url: "/billing", icon: CreditCard, roles: ["Admin"] },
  { title: "Reportes", url: "/reports", icon: BarChart3, roles: ["Admin"] },
]

const secondaryItems: Array<{ title: string; url: string; icon: typeof Settings; roles: AppRole[] }> = [
  { title: "Configuración", url: "/settings", icon: Settings, roles: ["Admin"] },
  { title: "Ayuda", url: "/help", icon: HelpCircle, roles: ["Admin", "Doctor", "Recepcionista"] },
]

type AppSidebarProps = {
  role?: string
}

export function AppSidebar({ role }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)
  const normalizedRole = normalizeRole(role)
  const isPathActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`)

  const handleLogout = async () => {
    if (loggingOut) return

    setLoggingOut(true)
    await authService.logout()
    router.replace("/auth/login")
    router.refresh()
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-10">
              <Link href="/dashboard">
                <Hospital className="size-5 text-sidebar-primary-foreground" />
                <span className="font-semibold text-base">
                  Clynic System
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* MAIN NAV */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              if (!item.roles.includes(normalizedRole)) {
                return null
              }

              const isActive = isPathActive(item.url)
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <div className="mt-auto">
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarMenu>
              {secondaryItems.map((item) => {
                if (!item.roles.includes(normalizedRole)) {
                  return null
                }

                const isActive = isPathActive(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Cerrar sesión" onClick={handleLogout} disabled={loggingOut}>
              <LogOut className="size-4" />
              <span>{loggingOut ? "Cerrando..." : "Cerrar sesión"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}