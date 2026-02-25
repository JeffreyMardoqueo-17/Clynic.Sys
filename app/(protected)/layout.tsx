"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/components/app-sidebar"
import { UserMenu } from "@/components/components/user-menu"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { authService } from "@/services/auth.service"
import { UsuarioResponseDto } from "@/types/auth"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioResponseDto | null>(null)

  useEffect(() => {
    authService
      .getProfile()
      .then(setUsuario)
      .catch(() => setUsuario(null))
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
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
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}