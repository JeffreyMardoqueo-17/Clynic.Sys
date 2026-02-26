"use client"

import { useEffect, useMemo, useState } from "react"
import { Eye, Pencil, RotateCcw, Trash2, Wrench } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { servicioService } from "@/services/servicio.service"
import { CreateServicioDto, ServicioResponseDto } from "@/types/servicio"

function money(value: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(value)
}

export default function ServicesPage() {
  const { showToast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)
  const [clinicId, setClinicId] = useState<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [servicios, setServicios] = useState<ServicioResponseDto[]>([])
  const [showInactive, setShowInactive] = useState(false)
  const [buscarNombre, setBuscarNombre] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [nombreServicio, setNombreServicio] = useState("")
  const [duracionMin, setDuracionMin] = useState<number>(30)
  const [precioBase, setPrecioBase] = useState<number>(0)

  const [selectedServicio, setSelectedServicio] = useState<ServicioResponseDto | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [editNombreServicio, setEditNombreServicio] = useState("")
  const [editDuracionMin, setEditDuracionMin] = useState<number>(30)
  const [editPrecioBase, setEditPrecioBase] = useState<number>(0)

  const loadData = async (idClinica: number, nombre?: string, incluirInactivos?: boolean) => {
    const data = await servicioService.obtenerPorClinica(idClinica, {
      nombre,
      incluirInactivos,
    })
    setServicios(data)
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const perfil = await authService.getProfile()
        const admin = String(perfil.rol) === "Admin" || String(perfil.rol) === "1"

        setIsAdmin(admin)
        setClinicId(perfil.idClinica)

        if (!admin) return

        await loadData(perfil.idClinica, "", false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar servicios")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  useEffect(() => {
    if (!clinicId || !isAdmin) return

    const run = async () => {
      try {
        await loadData(clinicId, buscarNombre, showInactive)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron aplicar los filtros")
      }
    }

    run()
  }, [clinicId, isAdmin, buscarNombre, showInactive])

  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((s) => (showInactive ? !s.activo : s.activo))
  }, [servicios, showInactive])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId) return

    setCreateLoading(true)
    setError(null)

    try {
      const payload: CreateServicioDto = {
        idClinica: clinicId,
        nombreServicio: nombreServicio.trim(),
        duracionMin,
        precioBase,
      }

      await servicioService.crear(payload)
      setCreateOpen(false)
      setNombreServicio("")
      setDuracionMin(30)
      setPrecioBase(0)

      await loadData(clinicId, buscarNombre, showInactive)
      showToast("Servicio creado correctamente.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el servicio"
      setError(message)
      showToast(message, "error")
    } finally {
      setCreateLoading(false)
    }
  }

  const openView = (servicio: ServicioResponseDto) => {
    setSelectedServicio(servicio)
    setViewOpen(true)
  }

  const openEdit = (servicio: ServicioResponseDto) => {
    setSelectedServicio(servicio)
    setEditNombreServicio(servicio.nombreServicio)
    setEditDuracionMin(servicio.duracionMin)
    setEditPrecioBase(servicio.precioBase)
    setEditOpen(true)
  }

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServicio || !clinicId) return

    setActionLoading(true)
    setError(null)

    try {
      await servicioService.actualizar(selectedServicio.id, {
        nombreServicio: editNombreServicio.trim(),
        duracionMin: editDuracionMin,
        precioBase: editPrecioBase,
      })

      setEditOpen(false)
      await loadData(clinicId, buscarNombre, showInactive)
      showToast("Servicio actualizado correctamente.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el servicio"
      setError(message)
      showToast(message, "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEliminar = async (servicio: ServicioResponseDto) => {
    const ok = window.confirm(`¿Deseas desactivar el servicio \"${servicio.nombreServicio}\"?`)
    if (!ok || !clinicId) return

    setActionLoading(true)
    setError(null)

    try {
      await servicioService.eliminar(servicio.id)
      await loadData(clinicId, buscarNombre, showInactive)
      showToast("Servicio desactivado.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo desactivar el servicio"
      setError(message)
      showToast(message, "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivar = async (servicio: ServicioResponseDto) => {
    const ok = window.confirm(`¿Deseas reactivar el servicio \"${servicio.nombreServicio}\"?`)
    if (!ok || !clinicId) return

    setActionLoading(true)
    setError(null)

    try {
      await servicioService.actualizar(servicio.id, { activo: true })
      await loadData(clinicId, buscarNombre, showInactive)
      showToast("Servicio reactivado.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo reactivar el servicio"
      setError(message)
      showToast(message, "error")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando servicios...</p>
  }

  if (!isAdmin) {
    return (
      <Card bordered={false} shadow={false}>
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
          <h1 className="hc-page-title text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-sm text-muted-foreground">
            Registra los servicios que brinda tu clínica con duración en minutos y costo por cita.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="hc-action-btn">Nuevo servicio</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCrear} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Registrar servicio</DialogTitle>
                <DialogDescription>Define el nombre, duración y costo base por cita.</DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="nombre-servicio">Nombre del servicio</Label>
                <Input
                  id="nombre-servicio"
                  value={nombreServicio}
                  onChange={(e) => setNombreServicio(e.target.value)}
                  placeholder="Ej. Limpieza dental"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duracion-servicio">Duración (min)</Label>
                  <Input
                    id="duracion-servicio"
                    type="number"
                    min={1}
                    value={duracionMin}
                    onChange={(e) => setDuracionMin(Number(e.target.value || 0))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precio-servicio">Costo por cita</Label>
                  <Input
                    id="precio-servicio"
                    type="number"
                    min={0}
                    step="0.01"
                    value={precioBase}
                    onChange={(e) => setPrecioBase(Number(e.target.value || 0))}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={createLoading || !nombreServicio.trim() || duracionMin <= 0 || precioBase < 0}>
                  {createLoading ? "Guardando..." : "Crear servicio"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <Card className="hc-soft-card py-0" bordered={false} shadow={false}>
        <CardHeader className="hc-hero py-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="buscar-servicio">Buscar servicio</Label>
              <Input
                id="buscar-servicio"
                value={buscarNombre}
                onChange={(e) => setBuscarNombre(e.target.value)}
                placeholder="Ej. Limpieza"
              />
            </div>
            <Button variant={showInactive ? "default" : "outline"} onClick={() => setShowInactive((prev) => !prev)}>
              {showInactive ? "Viendo inactivos" : "Ver inactivos"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="hc-soft-card" bordered={false} shadow={false}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Listado de servicios</CardTitle>
          <CardDescription>
            {serviciosFiltrados.length} registro(s) {showInactive ? "inactivos" : "activos"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Costo por cita</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-28">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviciosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                      {showInactive ? "No hay servicios inactivos." : "No hay servicios activos."}
                    </TableCell>
                  </TableRow>
                ) : (
                  serviciosFiltrados.map((servicio) => (
                    <TableRow key={servicio.id}>
                      <TableCell className="font-medium">{servicio.nombreServicio}</TableCell>
                      <TableCell>{servicio.duracionMin} min</TableCell>
                      <TableCell>{money(servicio.precioBase)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            servicio.activo
                              ? "inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                              : "inline-flex rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300"
                          }
                        >
                          {servicio.activo ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-24 items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-yellow-500/40 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-300"
                            onClick={() => openView(servicio)}
                            title="Ver"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 border-orange-500/40 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 dark:text-orange-300"
                            onClick={() => openEdit(servicio)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {showInactive ? (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                              onClick={() => handleReactivar(servicio)}
                              title="Activar"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 border-red-500/40 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300"
                              onClick={() => handleEliminar(servicio)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card bordered={false} shadow={false}>
        <CardContent className="flex items-start gap-2 py-4 text-sm text-muted-foreground">
          <Wrench className="mt-0.5 size-4" />
          La duración en minutos permitirá más adelante calcular capacidad diaria y máximos de citas por sucursal.
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del servicio</DialogTitle>
          </DialogHeader>

          {selectedServicio && (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Nombre:</span> {selectedServicio.nombreServicio}</p>
              <p><span className="font-medium">Duración:</span> {selectedServicio.duracionMin} min</p>
              <p><span className="font-medium">Costo por cita:</span> {money(selectedServicio.precioBase)}</p>
              <p><span className="font-medium">Estado:</span> {selectedServicio.activo ? "Activo" : "Inactivo"}</p>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditar} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Editar servicio</DialogTitle>
              <DialogDescription>Actualiza nombre, duración y costo por cita.</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="edit-nombre-servicio">Nombre</Label>
              <Input
                id="edit-nombre-servicio"
                value={editNombreServicio}
                onChange={(e) => setEditNombreServicio(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-duracion-servicio">Duración (min)</Label>
                <Input
                  id="edit-duracion-servicio"
                  type="number"
                  min={1}
                  value={editDuracionMin}
                  onChange={(e) => setEditDuracionMin(Number(e.target.value || 0))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-precio-servicio">Costo por cita</Label>
                <Input
                  id="edit-precio-servicio"
                  type="number"
                  min={0}
                  step="0.01"
                  value={editPrecioBase}
                  onChange={(e) => setEditPrecioBase(Number(e.target.value || 0))}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={actionLoading || !editNombreServicio.trim() || editDuracionMin <= 0 || editPrecioBase < 0}>
                {actionLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
