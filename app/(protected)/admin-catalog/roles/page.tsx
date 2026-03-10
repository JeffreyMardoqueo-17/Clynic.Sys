"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { sucursalService } from "@/services/sucursal.service"
import { RolDto } from "@/types/auth"
import { SucursalResponseDto } from "@/types/sucursal"

export default function RolesAdminPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [clinicId, setClinicId] = useState<number | null>(null)

  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [idSucursal, setIdSucursal] = useState<number>(0)
  const [roles, setRoles] = useState<RolDto[]>([])

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [saving, setSaving] = useState(false)

  const sucursalesActivas = useMemo(() => sucursales.filter((s) => s.activa), [sucursales])

  const loadRoles = async (idClinica: number, idSucursalActual: number) => {
    const data = await authService.getRolesBySucursal(idClinica, idSucursalActual)
    setRoles(data)
  }

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
        if (!primeraSucursal) {
          setError("No hay sucursales disponibles para administrar roles.")
          return
        }

        setIdSucursal(primeraSucursal.id)
        await loadRoles(perfil.idClinica, primeraSucursal.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la gestión de roles")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  useEffect(() => {
    if (!clinicId || !idSucursal || !isAdmin) {
      return
    }

    const run = async () => {
      try {
        await loadRoles(clinicId, idSucursal)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los roles")
      }
    }

    run()
  }, [clinicId, idSucursal, isAdmin])

  const handleCreateRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!clinicId || !idSucursal) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await authService.createRol({
        idClinica: clinicId,
        idSucursal,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
      })

      setNombre("")
      setDescripcion("")
      await loadRoles(clinicId, idSucursal)
      showToast("Rol creado correctamente.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el rol"
      setError(message)
      showToast(message, "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando roles...</p>
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
      <header>
        <h1 className="hc-page-title text-3xl font-bold tracking-tight">Roles</h1>
        <p className="text-sm text-muted-foreground">
          Crea y consulta roles por sucursal. Solo se admiten los roles del modelo actual: Admin, Doctor y Recepcionista.
        </p>
      </header>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <Card bordered={false} shadow={false}>
        <CardHeader>
          <CardTitle className="text-base">Crear rol</CardTitle>
          <CardDescription>Los roles se crean vinculados a una sucursal de la clínica.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRole} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sucursal-roles">Sucursal</Label>
              <select
                id="sucursal-roles"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={idSucursal}
                onChange={(e) => setIdSucursal(Number(e.target.value))}
              >
                {sucursalesActivas.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre-rol">Nombre del rol</Label>
              <Input
                id="nombre-rol"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Doctor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion-rol">Descripcion</Label>
              <Input
                id="descripcion-rol"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Rol para atencion de consultas"
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="hc-action-btn" disabled={saving}>
                {saving ? "Guardando..." : "Crear rol"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card bordered={false} shadow={false}>
        <CardHeader>
          <CardTitle className="text-base">Roles de la sucursal</CardTitle>
          <CardDescription>{roles.length} registro(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    No hay roles para esta sucursal.
                  </TableCell>
                </TableRow>
              )}
              {roles.map((rol) => (
                <TableRow key={rol.id}>
                  <TableCell className="font-medium">{rol.nombre}</TableCell>
                  <TableCell>{rol.descripcion || "Sin descripcion"}</TableCell>
                  <TableCell>{rol.activo ? "Activo" : "Inactivo"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
