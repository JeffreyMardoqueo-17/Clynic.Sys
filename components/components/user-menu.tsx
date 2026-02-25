"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, LogOut, Settings, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth.service"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserMenuProps = {
  userName?: string
  clinicName?: string
}

export function UserMenu({ userName, clinicName }: UserMenuProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    router.replace("/auth/login")
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9 rounded-full" disabled>
        <UserRound className="size-5" />
        <span className="sr-only">Cargando menú de usuario</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 rounded-full">
          <UserRound className="size-5" />
          <span className="sr-only">Abrir menú de usuario</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="text-sm font-semibold leading-tight">{userName ?? "Usuario"}</p>
            <p className="text-muted-foreground text-xs leading-tight mt-0.5">
              {clinicName ?? "Clínica no asignada"}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <UserRound className="size-4" />
              <span>Ver perfil</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="size-4" />
              <span>Configuración</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/help" className="cursor-pointer">
              <AlertTriangle className="size-4" />
              <span>Reportar error</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="cursor-pointer"
        >
          <LogOut className="size-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
