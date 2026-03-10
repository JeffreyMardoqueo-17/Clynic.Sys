"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ExternalLink, Eye, Globe, Save, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { landingPageService } from "@/services/landing-page.service"
import type { LandingServiceItemDto, UpsertLandingPageConfigDto } from "@/types/landing-page"

const PUBLIC_BASE_URL = "https://norvian.tech/clynic"

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function toServiceLines(items: LandingServiceItemDto[]) {
  if (items.length === 0) {
    return ""
  }

  return items
    .map((item) => `${item.titulo}|${item.descripcion}`)
    .join("\n")
}

function parseServiceLines(lines: string) {
  return lines
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [titulo, ...rest] = line.split("|")
      return {
        titulo: titulo?.trim() ?? "",
        descripcion: rest.join("|").trim(),
      }
    })
    .filter((item) => item.titulo.length > 0)
}

export default function ClinicLandingBuilderPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [idClinica, setIdClinica] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [serviceLines, setServiceLines] = useState("")

  const [form, setForm] = useState<UpsertLandingPageConfigDto>({
    idClinica: 0,
    nombreLanding: "",
    heroTitulo: "",
    heroSubtitulo: "",
    descripcionGeneral: "",
    telefonoContacto: "",
    correoContacto: "",
    direccionContacto: "",
    whatsappContacto: "",
    ctaPrincipalTexto: "Agendar cita",
    ctaPrincipalUrl: "/agendar-cita",
    serviciosDestacados: [],
    metaTitulo: "",
    metaDescripcion: "",
    dominioBase: "",
    mostrarHorariosSucursal: true,
    publicada: false,
  })

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const perfil = await authService.getProfile()
        const admin = String(perfil.rol) === "Admin" || String(perfil.rol) === "1"
        setIsAdmin(admin)
        if (!admin) {
          setError("Solo un administrador puede configurar la landing.")
          return
        }

        setIdClinica(perfil.idClinica)

        const data = await landingPageService.obtenerPorClinica(perfil.idClinica)
        setForm({
          idClinica: data.idClinica,
          nombreLanding: data.nombreLanding,
          heroTitulo: data.heroTitulo,
          heroSubtitulo: data.heroSubtitulo,
          descripcionGeneral: data.descripcionGeneral,
          telefonoContacto: data.telefonoContacto,
          correoContacto: data.correoContacto,
          direccionContacto: data.direccionContacto,
          whatsappContacto: data.whatsappContacto,
          ctaPrincipalTexto: data.ctaPrincipalTexto,
          ctaPrincipalUrl: data.ctaPrincipalUrl,
          serviciosDestacados: data.serviciosDestacados,
          metaTitulo: data.metaTitulo,
          metaDescripcion: data.metaDescripcion,
          dominioBase: data.dominioBase,
          mostrarHorariosSucursal: data.mostrarHorariosSucursal,
          publicada: data.publicada,
        })
        setServiceLines(toServiceLines(data.serviciosDestacados))
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el builder de landing")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const previewServices = useMemo(() => parseServiceLines(serviceLines), [serviceLines])
  const clinicaSlug = useMemo(() => slugify(form.nombreLanding || "nombre-clinica"), [form.nombreLanding])
  const publicLandingPath = `/clynic/${clinicaSlug}`
  const publicLandingUrl = `${PUBLIC_BASE_URL}/${clinicaSlug}`

  const guardar = async () => {
    if (!idClinica) {
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload: UpsertLandingPageConfigDto = {
        ...form,
        idClinica,
        serviciosDestacados: parseServiceLines(serviceLines),
      }

      const saved = await landingPageService.guardar(idClinica, payload)
      setForm((prev) => ({ ...prev, publicada: saved.publicada }))
      showToast("Landing guardada correctamente.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar la landing"
      setError(message)
      showToast(message, "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando constructor de landing...</p>
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Esta sección está disponible solo para administradores.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <h1 className="hc-page-title text-3xl font-bold tracking-tight">Builder de Landing</h1>
        <p className="text-sm text-muted-foreground">
          Configura la landing general de tu clínica. La URL pública se genera automáticamente con el nombre de la clínica.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Define contenido, contacto, SEO y estado de publicación.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre landing</Label>
                <Input value={form.nombreLanding} onChange={(e) => setForm((p) => ({ ...p, nombreLanding: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>URL pública (automática)</Label>
                <Input value={publicLandingUrl} readOnly />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Hero título</Label>
                <Input value={form.heroTitulo} onChange={(e) => setForm((p) => ({ ...p, heroTitulo: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Hero subtítulo</Label>
                <Input value={form.heroSubtitulo} onChange={(e) => setForm((p) => ({ ...p, heroSubtitulo: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descripción</Label>
                <textarea
                  className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  value={form.descripcionGeneral}
                  onChange={(e) => setForm((p) => ({ ...p, descripcionGeneral: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.telefonoContacto} onChange={(e) => setForm((p) => ({ ...p, telefonoContacto: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input value={form.correoContacto} onChange={(e) => setForm((p) => ({ ...p, correoContacto: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Dirección</Label>
                <Input value={form.direccionContacto} onChange={(e) => setForm((p) => ({ ...p, direccionContacto: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={form.whatsappContacto} onChange={(e) => setForm((p) => ({ ...p, whatsappContacto: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>CTA texto</Label>
                <Input value={form.ctaPrincipalTexto} onChange={(e) => setForm((p) => ({ ...p, ctaPrincipalTexto: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>CTA URL</Label>
                <Input value={form.ctaPrincipalUrl} onChange={(e) => setForm((p) => ({ ...p, ctaPrincipalUrl: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Servicios destacados (una línea por servicio: Título|Descripción)</Label>
                <textarea
                  className="border-input bg-background min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                  value={serviceLines}
                  onChange={(e) => setServiceLines(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Meta título</Label>
                <Input value={form.metaTitulo} onChange={(e) => setForm((p) => ({ ...p, metaTitulo: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Meta descripción</Label>
                <Input value={form.metaDescripcion} onChange={(e) => setForm((p) => ({ ...p, metaDescripcion: e.target.value }))} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.mostrarHorariosSucursal}
                  onChange={(e) => setForm((p) => ({ ...p, mostrarHorariosSucursal: e.target.checked }))}
                />
                Mostrar horarios de sucursal
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.publicada}
                  onChange={(e) => setForm((p) => ({ ...p, publicada: e.target.checked }))}
                />
                Publicada
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={guardar} disabled={saving}>
                <Save className="size-4" />
                {saving ? "Guardando..." : "Guardar landing"}
              </Button>
              <Button asChild variant="outline">
                <Link href="/clinic">
                  Volver a Mi Clínica
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-linear-to-b from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Eye className="size-4" /> Previsualización</CardTitle>
            <CardDescription>Así se verá tu landing con esta plantilla.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{form.nombreLanding || "Tu clínica"}</p>
              <h3 className="mt-2 text-2xl font-bold">{form.heroTitulo || "Título principal de tu landing"}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{form.heroSubtitulo || "Subtítulo de valor para paciente"}</p>
              <p className="mt-3 text-sm">{form.descripcionGeneral || "Descripción general de la propuesta de valor."}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" className="gap-1">
                  <Sparkles className="size-3.5" /> {form.ctaPrincipalTexto || "Agendar"}
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <Globe className="size-3.5" /> /clynic/{clinicaSlug || "nombre-clinica"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm font-semibold">Servicios destacados</p>
              {previewServices.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Agrega servicios en el formato Título|Descripción.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {previewServices.slice(0, 4).map((item, idx) => (
                    <div key={`${item.titulo}-${idx}`} className="rounded-md border p-2">
                      <p className="text-sm font-medium">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground">{item.descripcion || "Sin descripción"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-white p-4 text-sm">
              <p className="font-semibold">Contacto</p>
              <p className="text-muted-foreground">Tel: {form.telefonoContacto || "-"}</p>
              <p className="text-muted-foreground">Correo: {form.correoContacto || "-"}</p>
              <p className="text-muted-foreground">Dirección: {form.direccionContacto || "-"}</p>
              <p className="text-muted-foreground">WhatsApp: {form.whatsappContacto || "-"}</p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              URL pública de tu clínica: <strong className="text-foreground">{publicLandingUrl}</strong>
              <div className="mt-2">
                <Link className="inline-flex items-center gap-1 text-primary hover:underline" href={publicLandingPath} target="_blank">
                  <ExternalLink className="size-3.5" /> Abrir landing pública
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
