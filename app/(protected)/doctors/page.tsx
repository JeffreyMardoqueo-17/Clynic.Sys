"use client"

import { useEffect, useMemo, useState } from "react"
import { BriefcaseMedical, Filter, UserRoundPlus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { sucursalService } from "@/services/sucursal.service"
import { usuarioService } from "@/services/usuario.service"
import { SucursalResponseDto } from "@/types/sucursal"
import { UsuarioRol, UsuarioResponseDto } from "@/types/usuario"

const ROL_OPTIONS: Array<{ value: UsuarioRol; label: string }> = [
  { value: 2, label: "Doctor" },
  { value: 3, label: "Recepcionista" },
]

function rolToLabel(rol: UsuarioRol) {
  if (rol === 1) return "Admin"
  if (rol === 2) return "Doctor"
  return "Recepcionista"
}

export default function DoctorsPage() {
  const { showToast } = useToast()
  const [clinicId, setClinicId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [workers, setWorkers] = useState<UsuarioResponseDto[]>([])
  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const [nombreCompleto, setNombreCompleto] = useState("")
  const [correo, setCorreo] = useState("")
  const [rol, setRol] = useState<UsuarioRol>(2)
  const [idSucursalCrear, setIdSucursalCrear] = useState<string>("")
  const [sucursalFiltro, setSucursalFiltro] = useState<string>("all")

  const [rolFiltro, setRolFiltro] = useState<string>("all")

  const loadWorkers = async (idClinica: number, filtroSucursal: string) => {
    const usuariosClinica =
      filtroSucursal === "all"
        ? await usuarioService.obtenerPorClinica(idClinica)
        : await usuarioService.obtenerPorClinicaYSucursal(idClinica, Number(filtroSucursal))

    setWorkers(usuariosClinica)
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const perfil = await authService.getProfile()
      const perfilRol = String(perfil.rol)
      const admin = perfilRol === "Admin" || perfilRol === "1"

      setClinicId(perfil.idClinica)
      setIsAdmin(admin)

      if (!admin) {
        return
      }

      const sucursalesClinica = await sucursalService.obtenerPorClinica(perfil.idClinica)
      await loadWorkers(perfil.idClinica, "all")

      setSucursales(sucursalesClinica)
      if (sucursalesClinica.length > 0) {
        setIdSucursalCrear(String(sucursalesClinica[0].id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar trabajadores")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!clinicId || !isAdmin) return

    const run = async () => {
      try {
        await loadWorkers(clinicId, sucursalFiltro)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo aplicar el filtro por sucursal")
      }
    }

    run()
  }, [clinicId, isAdmin, sucursalFiltro])

  const workersFiltered = useMemo(() => {
    const sinAdmins = workers.filter((w) => w.rol !== 1)

    if (rolFiltro === "all") {
      return sinAdmins
    }

    const rolNumero = Number(rolFiltro) as UsuarioRol
    return sinAdmins.filter((w) => w.rol === rolNumero)
  }, [workers, rolFiltro])

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clinicId) return

    const idSucursal = Number(idSucursalCrear)
    if (!idSucursal || idSucursal <= 0) {
      setError("Debes seleccionar una sucursal")
      showToast("Debes seleccionar una sucursal", "warning")
      return
    }

    setCreateLoading(true)
    setError(null)

    try {
      await usuarioService.crear({
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim().toLowerCase(),
        idClinica: clinicId,
        idSucursal,
        rol,
      })

      setNombreCompleto("")
      setCorreo("")
      setRol(2)
      setCreateOpen(false)

      await loadWorkers(clinicId, sucursalFiltro)
      showToast("Trabajador creado. Se envió contraseña temporal al correo.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el trabajador"
      setError(message)
      showToast(message, "error")
    } finally {
      setCreateLoading(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando trabajadores...</p>
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Esta sección es solo para administradores.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="hc-page-title text-3xl font-bold tracking-tight">Trabajadores</h1>
          <p className="text-sm text-muted-foreground">
            Crea y administra doctores o recepcionistas de tu clínica.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="hc-action-btn">
              <UserRoundPlus className="size-4" />
              Nuevo trabajador
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCreateWorker} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Registrar trabajador</DialogTitle>
                <DialogDescription>
                  Ingresa datos básicos y rol. La contraseña temporal se genera automáticamente y se envía al correo.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="nombre-trabajador">Nombre completo</Label>
                <Input
                  id="nombre-trabajador"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Dr. Juan Pérez"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo-trabajador">Correo</Label>
                <Input
                  id="correo-trabajador"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="doctor@clinica.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol-trabajador">Rol</Label>
                <select
                  id="rol-trabajador"
                  value={rol}
                  onChange={(e) => setRol(Number(e.target.value) as UsuarioRol)}
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  required
                >
                  {ROL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sucursal-trabajador">Sucursal</Label>
                <select
                  id="sucursal-trabajador"
                  value={idSucursalCrear}
                  onChange={(e) => setIdSucursalCrear(e.target.value)}
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                  required
                >
                  {sucursales.length === 0 && <option value="">Sin sucursales disponibles</option>}
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={String(sucursal.id)}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? "Guardando..." : "Crear trabajador"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="hc-soft-card py-0">
        <CardHeader className="hc-hero py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-4" />
            Filtros de visualización
          </CardTitle>
          <CardDescription>
            Filtra trabajadores por rol y por sucursal dentro de tu clínica.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 py-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="filtro-rol">Filtrar por rol</Label>
            <select
              id="filtro-rol"
              value={rolFiltro}
              onChange={(e) => setRolFiltro(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
            >
              <option value="all">Todos</option>
              {ROL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-sucursal">Filtrar por sucursal</Label>
            <select
              id="filtro-sucursal"
              value={sucursalFiltro}
              onChange={(e) => setSucursalFiltro(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
            >
              <option value="all">Todas las sucursales</option>
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={String(sucursal.id)}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {workersFiltered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay trabajadores registrados para esta clínica.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {workersFiltered.map((worker) => (
            <Card key={worker.id} className="hc-soft-card py-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4" />
                  {worker.nombreCompleto}
                </CardTitle>
                <CardDescription>{worker.correo}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 pb-5 text-sm">
                <div className="hc-info-chip flex items-center justify-between p-2.5">
                  <span className="text-muted-foreground">Rol</span>
                  <span className="font-medium">{rolToLabel(worker.rol)}</span>
                </div>

                <div className="hc-info-chip flex items-center justify-between p-2.5">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="font-medium">{worker.activo ? "Activo" : "Inactivo"}</span>
                </div>

                <div className="hc-info-chip flex items-center justify-between p-2.5">
                  <span className="text-muted-foreground">Clínica</span>
                  <span className="font-medium">{worker.nombreClinica ?? `ID ${worker.idClinica}`}</span>
                </div>

                <div className="hc-info-chip flex items-center justify-between p-2.5">
                  <span className="text-muted-foreground">Sucursal</span>
                  <span className="font-medium">{worker.nombreSucursal ?? "Sin asignar"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="flex items-start gap-2 py-4 text-sm text-muted-foreground">
          <BriefcaseMedical className="mt-0.5 size-4" />
          El envío de credenciales temporales se ejecuta desde backend cuando creas el trabajador.
        </CardContent>
      </Card>
    </div>
  )
}
