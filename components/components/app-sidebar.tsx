"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

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

const navItems = [
  { title: "Dashboard", url: "/appointment", icon: LayoutDashboard },
  { title: "Pacientes", url: "/patients", icon: Users },
  { title: "Citas", url: "/appointments", icon: CalendarDays },
  { title: "Doctores", url: "/doctors", icon: Stethoscope },
  { title: "Sucursales", url: "/branches", icon: Building2 },
  { title: "Historial Clínico", url: "/records", icon: FileText },
  { title: "Facturación", url: "/billing", icon: CreditCard },
  { title: "Reportes", url: "/reports", icon: BarChart3 },
]

const secondaryItems = [
  { title: "Configuración", url: "/settings", icon: Settings },
  { title: "Ayuda", url: "/help", icon: HelpCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const isPathActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`)

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
            <SidebarMenuButton tooltip="Cerrar sesión">
              <LogOut className="size-4" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}