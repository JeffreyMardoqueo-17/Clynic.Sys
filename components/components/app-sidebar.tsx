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
  ChevronRight,
  UserCircle2,
  LogOut,
  Hospital,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { authService } from "@/services/auth.service"
import { AppRole, normalizeRole } from "@/lib/authorization"

type NavSubItem = {
  title: string
  url: string
  roles: AppRole[]
}

type NavSection = {
  title: string
  icon: typeof LayoutDashboard
  roles: AppRole[]
  items: NavSubItem[]
}

const navSections: NavSection[] = [
  {
    title: "Operacion",
    icon: LayoutDashboard,
    roles: ["Admin", "Doctor", "Recepcionista"],
    items: [
      { title: "Recepcion", url: "/reception", roles: ["Admin", "Recepcionista"] },
      { title: "Dashboard", url: "/dashboard", roles: ["Admin"] },
      { title: "Flujo de Citas", url: "/appointment", roles: ["Admin", "Doctor", "Recepcionista"] },
      { title: "Panel Doctor", url: "/doctor-panel", roles: ["Doctor"] },
    ],
  },
  {
    title: "Administración",
    icon: Stethoscope,
    roles: ["Admin"],
    items: [
      { title: "Trabajadores", url: "/doctors", roles: ["Admin"] },
      { title: "Servicios", url: "/services", roles: ["Admin"] },
      { title: "Especialidades Doctor", url: "/admin-catalog/especialidades", roles: ["Admin"] },
      { title: "Roles", url: "/admin-catalog/roles", roles: ["Admin"] },
    ],
  },
  {
    title: "Pacientes",
    icon: Users,
    roles: ["Admin", "Doctor", "Recepcionista"],
    items: [
      { title: "Registro Pacientes", url: "/patients", roles: ["Admin", "Doctor", "Recepcionista"] },
      { title: "Historial Clínico", url: "/records", roles: ["Admin", "Doctor", "Recepcionista"] },
    ],
  },
  {
    title: "Citas",
    icon: CalendarDays,
    roles: ["Admin", "Doctor", "Recepcionista"],
    items: [
      { title: "Agenda de Citas", url: "/appointment", roles: ["Admin", "Doctor", "Recepcionista"] },
      { title: "Historial de Citas", url: "/appointment?tab=history", roles: ["Admin", "Doctor", "Recepcionista"] },
      { title: "Cita Servicios", url: "/appointment-services", roles: ["Admin", "Doctor", "Recepcionista"] },
    ],
  },
  {
    title: "Clínica",
    icon: Hospital,
    roles: ["Admin"],
    items: [
      { title: "Mi Clínica", url: "/clinic", roles: ["Admin"] },
      { title: "Landing Builder", url: "/clinic/landing", roles: ["Admin"] },
      { title: "Sucursales", url: "/branches", roles: ["Admin"] },
    ],
  },
]

const secondaryItems: Array<{ title: string; url: string; icon: typeof UserCircle2; roles: AppRole[] }> = [
  { title: "Mi perfil", url: "/profile", icon: UserCircle2, roles: ["Admin", "Doctor", "Recepcionista"] },
]

type AppSidebarProps = {
  role?: string | number
}

export function AppSidebar({ role }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)
  const normalizedRole = normalizeRole(role)
  const homeUrl = normalizedRole === "Recepcionista" ? "/reception" : normalizedRole === "Doctor" ? "/doctor-panel" : "/dashboard"
  const isPathActive = (url: string) => {
    const [baseUrl] = url.split("?")
    return pathname === baseUrl || pathname.startsWith(`${baseUrl}/`)
  }
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

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
              <Link href={homeUrl}>
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
            {navSections.map((section) => {
              if (!section.roles.includes(normalizedRole)) {
                return null
              }

              const subItems = section.items.filter((subItem) => subItem.roles.includes(normalizedRole))
              if (subItems.length === 0) {
                return null
              }

              const sectionActive = subItems.some((subItem) => isPathActive(subItem.url))
              const isOpen = openSections[section.title] ?? sectionActive
              return (
                <SidebarMenuItem key={section.title}>
                  <SidebarMenuButton
                    isActive={sectionActive}
                    tooltip={section.title}
                    onClick={() =>
                      setOpenSections((prev) => ({
                        ...prev,
                        [section.title]: !isOpen,
                      }))
                    }
                  >
                    <section.icon className="size-4" />
                    <span>{section.title}</span>
                    <ChevronRight className={`ml-auto size-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </SidebarMenuButton>

                  {isOpen && (
                    <SidebarMenuSub>
                      {subItems.map((subItem) => {
                        const isActive = isPathActive(subItem.url)
                        return (
                          <SidebarMenuSubItem key={`${section.title}-${subItem.title}`}>
                            <SidebarMenuSubButton asChild isActive={isActive}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  )}
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