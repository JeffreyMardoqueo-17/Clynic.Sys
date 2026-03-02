"use client"

import { useEffect, useState } from "react"
import { Building2, CalendarClock, CalendarDays, CalendarX2, Stethoscope, Users } from "lucide-react"

import { ChartAreaCitas } from "@/components/dashboard/chart-area-citas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { normalizeRole, type AppRole } from "@/lib/authorization"
import { authService } from "@/services/auth.service"
import { dashboardService } from "@/services/dashboard.service"
import { sucursalService } from "@/services/sucursal.service"
import { DashboardCitaPendienteDto, DashboardCitasSerieDto, DashboardOperativoDto, DashboardPeriodo, DashboardResumenDto } from "@/types/dashboard"
import { SucursalResponseDto } from "@/types/sucursal"

const PERIODOS: Array<{ label: string; value: DashboardPeriodo }> = [
  { label: "Semanal", value: "semanal" },
  { label: "Mensual", value: "mensual" },
  { label: "Anual", value: "anual" },
  { label: "Todo", value: "todo" },
]
const VENTANA_PROXIMAS_HORAS = 8

function toDateParam(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getRangeForPeriodo(periodo: DashboardPeriodo, now = new Date()) {
  if (periodo === "todo") {
    return null
  }

  if (periodo === "semanal") {
    const day = now.getDay()
    const mondayDiff = day === 0 ? -6 : 1 - day
    const from = new Date(now)
    from.setDate(now.getDate() + mondayDiff)
    const to = new Date(from)
    to.setDate(from.getDate() + 6)
    return { from, to }
  }

  if (periodo === "mensual") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { from, to }
  }

  const from = new Date(now.getFullYear(), 0, 1)
  const to = new Date(now.getFullYear(), 11, 31)
  return { from, to }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [perfilReady, setPerfilReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState<DashboardPeriodo>("mensual")
  const [role, setRole] = useState<AppRole>("Unknown")
  const [idClinica, setIdClinica] = useState(0)
  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [idSucursalFiltro, setIdSucursalFiltro] = useState<number | "all">("all")
  const [resumen, setResumen] = useState<DashboardResumenDto | null>(null)
  const [operativo, setOperativo] = useState<DashboardOperativoDto | null>(null)
  const [serie, setSerie] = useState<DashboardCitasSerieDto | null>(null)
  const [proximasCitas, setProximasCitas] = useState<DashboardCitaPendienteDto[]>([])
  const [totalPendientes, setTotalPendientes] = useState(0)

  const isAdmin = role === "Admin"

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile()
        const normalizedRole = normalizeRole(profile.rol)
        setRole(normalizedRole)
        setIdClinica(profile.idClinica)

        if (normalizedRole === "Admin") {
          const sucursalesData = await sucursalService.obtenerPorClinica(profile.idClinica)
          setSucursales(sucursalesData.filter((s) => s.activa))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el perfil")
      } finally {
        setPerfilReady(true)
      }
    }

    loadProfile()
  }, [])

  useEffect(() => {
    if (!perfilReady) {
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const range = getRangeForPeriodo(periodo)
        const idSucursal = isAdmin && idSucursalFiltro !== "all" ? idSucursalFiltro : undefined

        const [resumenData, serieData, operativoData] = await Promise.all([
          dashboardService.obtenerResumen({ idSucursal }),
          range
            ? dashboardService.obtenerCitasPorDia({
                fechaDesde: toDateParam(range.from),
                fechaHasta: toDateParam(range.to),
                idSucursal,
              })
            : dashboardService.obtenerCitasPorDia({ periodo: "todo", idSucursal }),
          dashboardService.obtenerOperativo({ idSucursal }),
        ])

        setResumen(resumenData)
        setOperativo(operativoData)
        setSerie(serieData)
        setTotalPendientes(operativoData.totalCitasPendientes)

        const ahora = new Date()
        const limite = new Date(ahora)
        limite.setHours(limite.getHours() + VENTANA_PROXIMAS_HORAS)

        const proximas = operativoData.pendientes
          .filter((cita) => {
            const inicio = new Date(cita.fechaHoraInicioPlan)
            return inicio >= ahora && inicio <= limite
          })
          .sort((a, b) => new Date(a.fechaHoraInicioPlan).getTime() - new Date(b.fechaHoraInicioPlan).getTime())

        setProximasCitas(proximas)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [periodo, idSucursalFiltro, isAdmin, perfilReady])

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
        <h1 className="text-3xl font-bold">Panel General</h1>
        <p className="text-muted-foreground">Resumen operativo de la clínica.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2">
          {isAdmin && (
            <>
              <span className="px-2 text-sm text-muted-foreground">Sucursal:</span>
              <select
                className="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
                value={idSucursalFiltro}
                onChange={(e) =>
                  setIdSucursalFiltro(e.target.value === "all" ? "all" : Number(e.target.value))
                }
              >
                <option value="all">Todas</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </>
          )}

          <span className="px-2 text-sm text-muted-foreground">Período:</span>
          {PERIODOS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriodo(item.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                periodo === item.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <h3 className="text-sm text-muted-foreground">Pacientes</h3>
              <p className="mt-2 text-2xl font-bold">{loading ? "..." : (resumen?.totalPacientes ?? 0)}</p>
            </div>
            <div className="rounded-xl bg-primary p-3 text-primary-foreground shadow-sm">
              <Users className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <h3 className="text-sm text-muted-foreground">Citas de hoy</h3>
              <p className="mt-2 text-2xl font-bold">{loading ? "..." : (operativo?.totalCitasHoy ?? resumen?.totalCitasHoy ?? 0)}</p>
            </div>
            <div className="rounded-xl bg-accent p-3 text-accent-foreground shadow-sm">
              <CalendarDays className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <h3 className="text-sm text-muted-foreground">Trabajadores activos</h3>
              <p className="mt-2 text-2xl font-bold">{loading ? "..." : (operativo?.totalTrabajadores ?? resumen?.totalTrabajadores ?? 0)}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-secondary-foreground shadow-sm">
              <Stethoscope className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted-foreground/40">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <h3 className="text-sm text-muted-foreground">Sucursales activas</h3>
              <p className="mt-2 text-2xl font-bold">{loading ? "..." : (resumen?.totalSucursales ?? 0)}</p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-muted-foreground shadow-sm">
              <Building2 className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-9">
          {loading && <p className="text-sm text-muted-foreground">Cargando gráfico...</p>}
          {!loading && serie && <ChartAreaCitas serie={serie} periodo={periodo} />}
        </div>

        <Card className="xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Próximas citas
            </CardTitle>
            <CardDescription>
              Seguimiento de agenda para las próximas {VENTANA_PROXIMAS_HORAS} horas laborales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {isAdmin && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-muted-foreground">Sucursal aplicada</p>
                <p className="mt-1 font-semibold">
                  {idSucursalFiltro === "all"
                    ? "Todas"
                    : sucursales.find((s) => s.id === idSucursalFiltro)?.nombre ?? `Sucursal ${idSucursalFiltro}`}
                </p>
              </div>
            )}
            <div className="rounded-md bg-muted p-3">
              <p className="text-muted-foreground">Pendientes totales</p>
              <p className="mt-1 font-semibold">{loading ? "..." : totalPendientes}</p>
            </div>

            {loading ? (
              <p className="text-muted-foreground">Cargando próximas citas...</p>
            ) : proximasCitas.length === 0 ? (
              <div className="rounded-md bg-muted p-4 text-center">
                <CalendarX2 className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="font-medium">No hay citas próximas</p>
                <p className="text-xs text-muted-foreground">
                  No hay citas para las próximas {VENTANA_PROXIMAS_HORAS} horas del día laboral.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">Siguiente cita</p>
                  <p className="mt-1 font-semibold">{proximasCitas[0].nombrePaciente}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(proximasCitas[0].fechaHoraInicioPlan).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Próximas en ventana</p>
                  {proximasCitas.slice(0, 4).map((cita) => (
                    <div key={cita.idCita} className="rounded-md bg-muted p-2">
                      <p className="font-medium">#{cita.idCita} · {cita.nombrePaciente}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(cita.fechaHoraInicioPlan).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}