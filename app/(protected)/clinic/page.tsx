"use client"

import { useEffect, useState } from "react"
import { Building2, MapPin, Phone, Hospital, Building } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/services/auth.service"
import { clinicaService } from "@/services/clinica.service"
import { sucursalService } from "@/services/sucursal.service"
import { ClinicaResponseDto } from "@/types/clinica"
import { SucursalResponseDto } from "@/types/sucursal"

export default function ClinicPage() {
  const [clinica, setClinica] = useState<ClinicaResponseDto | null>(null)
  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const perfil = await authService.getProfile()
        const [clinicaData, sucursalesData] = await Promise.all([
          clinicaService.obtenerPorId(perfil.idClinica),
          sucursalService.obtenerPorClinica(perfil.idClinica),
        ])

        setClinica(clinicaData)
        setSucursales(sucursalesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la clínica")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando clínica...</p>
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="hc-page-title text-3xl font-bold tracking-tight">Mi Clínica</h1>
        <p className="text-sm text-muted-foreground">
          Información de la clínica asignada a tu usuario y sus sucursales.
        </p>
      </header>

      <Card className="hc-soft-card overflow-hidden py-0">
        <div className="hc-hero px-6 py-6 md:px-8">
          <div className="flex items-start gap-3">
            <div className="hc-icon-badge p-2.5">
              <Hospital className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{clinica?.nombre ?? "Clínica"}</h2>
              <p className="text-sm text-muted-foreground">
                Estado: {clinica?.activa ? "Activa" : "Inactiva"}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="grid gap-3 py-6 md:grid-cols-2 md:px-8">
          <div className="hc-info-chip p-3 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teléfono</p>
            <p className="flex items-center gap-2 font-medium">
              <Phone className="size-4 text-muted-foreground" />
              {clinica?.telefono || "Sin teléfono"}
            </p>
          </div>
          <div className="hc-info-chip p-3 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dirección</p>
            <p className="flex items-center gap-2 font-medium">
              <MapPin className="size-4 text-muted-foreground" />
              {clinica?.direccion || "Sin dirección"}
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h3 className="hc-page-title text-lg font-semibold">Sucursales ({sucursales.length})</h3>
          <p className="text-sm text-muted-foreground">
            Estas sucursales pertenecen a {clinica?.nombre ?? "tu clínica"}.
          </p>
        </div>

        {sucursales.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No hay sucursales registradas para esta clínica.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {sucursales.map((sucursal) => (
              <Card key={sucursal.id} className="hc-soft-card py-0">
                <CardHeader className="hc-hero py-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="size-4 text-chart-2" />
                    {sucursal.nombre}
                  </CardTitle>
                  <CardDescription>{sucursal.direccion}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
