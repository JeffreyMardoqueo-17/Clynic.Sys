"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/components/app-sidebar"
import { StatusAlert } from "@/components/components/status-alert"
import { UserMenu } from "@/components/components/user-menu"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth.service"
import { UsuarioResponseDto } from "@/types/auth"
import { normalizeRole } from "@/lib/authorization"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioResponseDto | null>(null)
  const role = normalizeRole(usuario?.rol)
  const showForceChangeAlert = role !== "Admin" && Boolean(usuario?.debeCambiarClave)

  useEffect(() => {
    authService
      .getProfile()
      .then(setUsuario)
      .catch(() => setUsuario(null))
  }, [])

  useEffect(() => {
    const onPasswordUpdated = () => {
      setUsuario((prev) => (prev ? { ...prev, debeCambiarClave: false } : prev))
    }

    window.addEventListener("clynic:password-updated", onPasswordUpdated)

    return () => {
      window.removeEventListener("clynic:password-updated", onPasswordUpdated)
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar role={usuario?.rol} />
      <SidebarInset className="min-h-0 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <header className="border-border bg-background/95 sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <div className="text-right leading-tight">
                <p className="text-foreground text-sm font-semibold">
                  {usuario?.nombreCompleto ?? "Usuario"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {usuario?.nombreClinica ?? "Clínica no asignada"}
                </p>
              </div>
              <UserMenu
                userName={usuario?.nombreCompleto}
                clinicName={usuario?.nombreClinica}
              />
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-hidden p-3 md:p-4">
            <div className="bg-card border-border h-full overflow-auto rounded-xl border p-4 md:p-5">
              {showForceChangeAlert && (
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <StatusAlert
                    type="warning"
                    message="Tu cuenta tiene contraseña temporal. Debes cambiarla para mantener la seguridad de tu sesión."
                    className="flex-1"
                  />
                  <Button asChild size="sm" className="shrink-0">
                    <Link href="/profile">Cambiar ahora</Link>
                  </Button>
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}