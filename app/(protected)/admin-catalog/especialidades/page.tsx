"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Building2, CircleAlert, CircleCheckBig, PlusCircle, Sparkles, Stethoscope } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { sucursalService } from "@/services/sucursal.service"
import { EspecialidadDto, EspecialidadSucursalDto } from "@/types/auth"
import { SucursalResponseDto } from "@/types/sucursal"

export default function EspecialidadesDoctorAdminPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [clinicId, setClinicId] = useState<number | null>(null)

  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [especialidades, setEspecialidades] = useState<EspecialidadDto[]>([])
  const [idSucursalVista, setIdSucursalVista] = useState<number>(0)
  const [especialidadesSucursal, setEspecialidadesSucursal] = useState<EspecialidadSucursalDto[]>([])

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [createSaving, setCreateSaving] = useState(false)

  const [idEspecialidadAsignar, setIdEspecialidadAsignar] = useState<number>(0)
  const [sucursalesAsignar, setSucursalesAsignar] = useState<number[]>([])
  const [assignSaving, setAssignSaving] = useState(false)
  const [savingSucursalId, setSavingSucursalId] = useState<number | null>(null)
  const [savingGlobalEstado, setSavingGlobalEstado] = useState(false)
  const [estadoEspecialidadPorSucursal, setEstadoEspecialidadPorSucursal] = useState<Record<number, boolean>>({})

  const sucursalesActivas = useMemo(() => sucursales.filter((s) => s.activa), [sucursales])
  const especialidadSeleccionada = useMemo(
    () => especialidades.find((item) => item.id === idEspecialidadAsignar) ?? null,
    [especialidades, idEspecialidadAsignar]
  )
  const totalSucursalesActivasSeleccion = useMemo(
    () => sucursalesActivas.filter((sucursal) => estadoEspecialidadPorSucursal[sucursal.id]).length,
    [sucursalesActivas, estadoEspecialidadPorSucursal]
  )

  const loadEspecialidadesClinica = async (idClinica: number) => {
    const data = await authService.getDoctorEspecialidadesByClinica(idClinica)
    setEspecialidades(data)
    if (data.length > 0) {
      setIdEspecialidadAsignar((prev) => (prev > 0 ? prev : data[0].id))
    }
  }

  const loadEspecialidadesSucursal = async (idClinica: number, idSucursal: number) => {
    const data = await authService.getDoctorEspecialidadesBySucursal(idClinica, idSucursal)
    setEspecialidadesSucursal(data)
  }

  const loadEstadoEspecialidadPorSucursal = useCallback(async (idClinica: number, idEspecialidad: number) => {
    const rows = await Promise.all(
      sucursalesActivas.map(async (sucursal) => {
        const data = await authService.getDoctorEspecialidadesBySucursal(idClinica, sucursal.id)
        const activa = data.some((item) => item.idEspecialidad === idEspecialidad && item.activa)
        return { idSucursal: sucursal.id, activa }
      })
    )

    const next: Record<number, boolean> = {}
    for (const row of rows) {
      next[row.idSucursal] = row.activa
    }
    setEstadoEspecialidadPorSucursal(next)
  }, [sucursalesActivas])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const perfil = await authService.getProfile()
        const admin = String(perfil.rol) === "Admin" || String(perfil.rol) === "1"
        setIsAdmin(admin)

        if (!admin) {
          return
        }

        setClinicId(perfil.idClinica)
        const dataSucursales = await sucursalService.obtenerPorClinica(perfil.idClinica)
        setSucursales(dataSucursales)

        const primeraSucursal = dataSucursales.find((s) => s.activa) ?? dataSucursales[0]
        if (primeraSucursal) {
          setIdSucursalVista(primeraSucursal.id)
        }

        await loadEspecialidadesClinica(perfil.idClinica)
        if (primeraSucursal) {
          await loadEspecialidadesSucursal(perfil.idClinica, primeraSucursal.id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la gestión de especialidades")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  useEffect(() => {
    if (!clinicId || !idSucursalVista || !isAdmin) {
      return
    }

    const run = async () => {
      try {
        await loadEspecialidadesSucursal(clinicId, idSucursalVista)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el detalle por sucursal")
      }
    }

    run()
  }, [clinicId, idSucursalVista, isAdmin])

  useEffect(() => {
    if (!clinicId || !idEspecialidadAsignar || !isAdmin || sucursalesActivas.length === 0) {
      return
    }

    const run = async () => {
      try {
        await loadEstadoEspecialidadPorSucursal(clinicId, idEspecialidadAsignar)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el estado de especialidad por sucursal")
      }
    }

    run()
  }, [clinicId, idEspecialidadAsignar, isAdmin, sucursalesActivas, loadEstadoEspecialidadPorSucursal])

  const handleCreateEspecialidad = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!clinicId) {
      return
    }

    setCreateSaving(true)
    setError(null)

    try {
      await authService.createDoctorEspecialidad({
        idClinica: clinicId,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
      })

      setNombre("")
      setDescripcion("")
      await loadEspecialidadesClinica(clinicId)
      if (idSucursalVista > 0) {
        await loadEspecialidadesSucursal(clinicId, idSucursalVista)
      }
      showToast("Especialidad creada correctamente.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear la especialidad"
      setError(message)
      showToast(message, "error")
    } finally {
      setCreateSaving(false)
    }
  }

  const toggleSucursalAsignar = (idSucursal: number, checked: boolean) => {
    setSucursalesAsignar((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, idSucursal]))
      }
      return prev.filter((id) => id !== idSucursal)
    })
  }

  const handleAsignar = async () => {
    if (!clinicId || !idEspecialidadAsignar || sucursalesAsignar.length === 0) {
      showToast("Selecciona especialidad y al menos una sucursal.", "warning")
      return
    }

    setAssignSaving(true)
    setError(null)

    try {
      await authService.asignarDoctorEspecialidadASucursales({
        idClinica: clinicId,
        idEspecialidad: idEspecialidadAsignar,
        idsSucursales: sucursalesAsignar,
      })

      setSucursalesAsignar([])
      await Promise.all([
        loadEspecialidadesSucursal(clinicId, idSucursalVista),
        loadEstadoEspecialidadPorSucursal(clinicId, idEspecialidadAsignar),
      ])
      showToast("Especialidad asignada correctamente.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo asignar la especialidad"
      setError(message)
      showToast(message, "error")
    } finally {
      setAssignSaving(false)
    }
  }

  const toggleEstadoEnSucursal = async (idSucursal: number, activaActual: boolean) => {
    if (!clinicId || !idEspecialidadAsignar) {
      return
    }

    setSavingSucursalId(idSucursal)
    setError(null)
    try {
      await authService.actualizarEstadoEspecialidadEnSucursales({
        idClinica: clinicId,
        idEspecialidad: idEspecialidadAsignar,
        idsSucursales: [idSucursal],
        activa: !activaActual,
      })

      await Promise.all([
        loadEspecialidadesSucursal(clinicId, idSucursalVista),
        loadEstadoEspecialidadPorSucursal(clinicId, idEspecialidadAsignar),
      ])
      showToast(!activaActual ? "Especialidad activada en sucursal." : "Especialidad desactivada en sucursal.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el estado en sucursal"
      setError(message)
      showToast(message, "error")
    } finally {
      setSavingSucursalId(null)
    }
  }

  const cambiarEstadoGlobal = async (activa: boolean) => {
    if (!clinicId || !idEspecialidadAsignar || sucursalesActivas.length === 0) {
      return
    }

    setSavingGlobalEstado(true)
    setError(null)
    try {
      await authService.actualizarEstadoEspecialidadEnSucursales({
        idClinica: clinicId,
        idEspecialidad: idEspecialidadAsignar,
        idsSucursales: sucursalesActivas.map((s) => s.id),
        activa,
      })

      await Promise.all([
        loadEspecialidadesSucursal(clinicId, idSucursalVista),
        loadEstadoEspecialidadPorSucursal(clinicId, idEspecialidadAsignar),
      ])
      showToast(activa ? "Especialidad activada en todas las sucursales." : "Especialidad desactivada en todas las sucursales.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el estado global"
      setError(message)
      showToast(message, "error")
    } finally {
      setSavingGlobalEstado(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando especialidades...</p>
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
      <header className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/15 via-background to-background p-5">
        <h1 className="hc-page-title flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Stethoscope className="size-7 text-primary" /> Especialidades Doctor
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea especialidades y actívalas o desactívalas por sucursal con un clic.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Alcance actual de API: especialidades para operación médica (rol Doctor).</p>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs">
            <p className="font-semibold text-primary">Paso 1</p>
            <p className="text-muted-foreground">Crea la especialidad si no existe.</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs">
            <p className="font-semibold text-primary">Paso 2</p>
            <p className="text-muted-foreground">Selecciona la especialidad a gestionar.</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs">
            <p className="font-semibold text-primary">Paso 3</p>
            <p className="text-muted-foreground">Activa o desactiva por sucursal.</p>
          </div>
        </div>
      </header>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <Card bordered={false} shadow={false} className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><PlusCircle className="size-4 text-primary" /> Paso 1: Crear especialidad</CardTitle>
          <CardDescription>Las especialidades se registran a nivel clínica.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateEspecialidad} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre-especialidad">Nombre</Label>
              <Input
                id="nombre-especialidad"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Pediatria"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion-especialidad">Descripcion</Label>
              <Input
                id="descripcion-especialidad"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Consulta y seguimiento pediatrico"
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="hc-action-btn" disabled={createSaving}>
                {createSaving ? "Guardando..." : "Crear especialidad"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card bordered={false} shadow={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-4 text-primary" /> Paso 2 y 3: Gestionar por sucursal</CardTitle>
          <CardDescription>Selecciona especialidad y usa la tabla para activar o desactivar rápidamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="especialidad-asignar">Especialidad</Label>
              <select
                id="especialidad-asignar"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={idEspecialidadAsignar}
                onChange={(e) => setIdEspecialidadAsignar(Number(e.target.value))}
              >
                {especialidades.map((especialidad) => (
                  <option key={especialidad.id} value={especialidad.id}>
                    {especialidad.nombre}
                  </option>
                ))}
              </select>
              {especialidadSeleccionada && (
                <p className="text-xs text-muted-foreground">
                  Gestionando: <strong className="text-foreground">{especialidadSeleccionada.nombre}</strong>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sucursal-vista">Sucursal para vista</Label>
              <select
                id="sucursal-vista"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={idSucursalVista}
                onChange={(e) => setIdSucursalVista(Number(e.target.value))}
              >
                {sucursalesActivas.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            Activa actual: {totalSucursalesActivasSeleccion} de {sucursalesActivas.length} sucursales.
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" variant="secondary" disabled={savingGlobalEstado || idEspecialidadAsignar <= 0} onClick={() => cambiarEstadoGlobal(true)}>
              <CircleCheckBig className="size-4" /> Activar en todas
            </Button>
            <Button type="button" variant="outline" disabled={savingGlobalEstado || idEspecialidadAsignar <= 0} onClick={() => cambiarEstadoGlobal(false)}>
              <CircleAlert className="size-4" /> Desactivar en todas
            </Button>
            <Button onClick={handleAsignar} className="hc-action-btn" disabled={assignSaving || sucursalesAsignar.length === 0}>
              {assignSaving ? "Asignando..." : `Asignar seleccionadas (${sucursalesAsignar.length})`}
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Lote</TableHead>
                  <TableHead>Sucursal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Accion rapida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sucursalesActivas.map((sucursal) => {
                  const activa = Boolean(estadoEspecialidadPorSucursal[sucursal.id])
                  const isSaving = savingSucursalId === sucursal.id
                  const checked = sucursalesAsignar.includes(sucursal.id)

                  return (
                    <TableRow key={sucursal.id} className={activa ? "bg-emerald-50/30" : "bg-amber-50/30"}>
                      <TableCell>
                        <input
                          aria-label={`Seleccionar ${sucursal.nombre}`}
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggleSucursalAsignar(sucursal.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{sucursal.nombre}</TableCell>
                      <TableCell>
                        <Badge variant={activa ? "default" : "outline"}>{activa ? "Activa" : "Inactiva"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant={activa ? "outline" : "default"}
                          onClick={() => toggleEstadoEnSucursal(sucursal.id, activa)}
                          disabled={isSaving || idEspecialidadAsignar <= 0}
                        >
                          {isSaving ? "Guardando..." : activa ? "Desactivar" : "Activar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card bordered={false} shadow={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-primary" /> Especialidades activas en la sucursal seleccionada</CardTitle>
          <CardDescription>{especialidadesSucursal.length} registro(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Especialidad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {especialidadesSucursal.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                    No hay especialidades habilitadas en esta sucursal.
                  </TableCell>
                </TableRow>
              )}
              {especialidadesSucursal.map((especialidad) => (
                <TableRow key={especialidad.id}>
                  <TableCell className="font-medium">{especialidad.nombreEspecialidad}</TableCell>
                  <TableCell>{especialidad.activa ? "Activa" : "Inactiva"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
