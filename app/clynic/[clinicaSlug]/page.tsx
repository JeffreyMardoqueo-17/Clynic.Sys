import Link from "next/link"
import { Sora, Manrope } from "next/font/google"
import { Check, Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Star, Stethoscope } from "lucide-react"

import type { LandingPublicResponseDto } from "@/types/landing-page"

const headingFont = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

const diasSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]

function apiUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL
  if (!value) {
    throw new Error("NEXT_PUBLIC_API_URL no esta configurada")
  }

  return value.replace(/\/$/, "")
}

async function obtenerLandingPublica(clinicaSlug: string): Promise<LandingPublicResponseDto | null> {
  try {
    const query = new URLSearchParams({ clinicaSlug })
    const response = await fetch(`${apiUrl()}/api/LandingPages/public?${query.toString()}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as LandingPublicResponseDto
  } catch {
    return null
  }
}

export default async function LandingClinicaPage({ params }: { params: Promise<{ clinicaSlug: string }> }) {
  const { clinicaSlug } = await params
  const data = await obtenerLandingPublica(clinicaSlug)

  if (!data) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className={`${headingFont.className} text-3xl font-extrabold`}>Landing no encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">No hay una landing publicada para esta clinica.</p>
        <Link className="mt-5 inline-flex rounded-md border px-3 py-2 text-sm" href="/">
          Ir al inicio
        </Link>
      </main>
    )
  }

  const serviciosParaMostrar = data.serviciosDestacados.length > 0 ? data.serviciosDestacados : data.serviciosClinica.slice(0, 6).map((s) => ({
    titulo: s.nombreServicio,
    descripcion: `Duracion ${s.duracionMin} min · Desde $${s.precioBase}`,
  }))

  return (
    <main className={`${bodyFont.className} min-h-screen bg-[radial-gradient(circle_at_10%_15%,hsl(var(--primary)/0.22),transparent_35%),radial-gradient(circle_at_95%_10%,hsl(var(--chart-2)/0.24),transparent_32%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.45))]`}>
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-10 md:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.17em] text-primary">
              <Stethoscope className="size-3.5" />
              {data.nombreClinica}
            </p>
            <h1 className={`${headingFont.className} mt-5 text-4xl font-extrabold leading-tight md:text-6xl`}>
              {data.heroTitulo}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{data.heroSubtitulo}</p>
            <p className="mt-4 max-w-2xl text-sm md:text-base">{data.descripcionGeneral}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={data.ctaPrincipalUrl || "/agendar-cita"}
                className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_35px_-16px_hsl(var(--primary))] transition hover:-translate-y-0.5"
              >
                {data.ctaPrincipalTexto || "Agendar cita"}
              </Link>
              <Link
                href="/agendar-cita"
                className="inline-flex items-center rounded-xl border border-primary/30 bg-background/70 px-5 py-3 text-sm font-semibold backdrop-blur"
              >
                Ver disponibilidad
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-primary/20 bg-background/75 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Servicios</p>
                <p className={`${headingFont.className} mt-1 text-2xl font-bold`}>{Math.max(data.serviciosClinica.length, serviciosParaMostrar.length)}</p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-background/75 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Sucursal base</p>
                <p className={`${headingFont.className} mt-1 text-lg font-bold`}>{data.nombreSucursal}</p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-background/75 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Horarios</p>
                <p className={`${headingFont.className} mt-1 text-2xl font-bold`}>{data.horariosSucursal.length || "-"}</p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-primary/20 bg-background/80 p-6 shadow-[0_30px_70px_-40px_hsl(var(--primary))] backdrop-blur">
            <h2 className={`${headingFont.className} text-xl font-bold`}>Contacto rapido</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Phone className="size-4 text-primary" /> {data.telefonoContacto || "Sin telefono"}</p>
              <p className="flex items-center gap-2"><Mail className="size-4 text-primary" /> {data.correoContacto || "Sin correo"}</p>
              <p className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> {data.direccionContacto || "Sin direccion"}</p>
              <p className="flex items-center gap-2"><MessageCircle className="size-4 text-primary" /> {data.whatsappContacto || "Sin WhatsApp"}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-chart-2/30 bg-chart-2/10 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="size-4" /> Atencion segura y trazable</p>
              <p className="mt-2 text-muted-foreground">Gestiona tus citas, historial y seguimiento en una experiencia ordenada para paciente y recepcion.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-4">
        <div className="rounded-3xl border border-primary/15 bg-background/75 p-6 md:p-8">
          <h2 className={`${headingFont.className} text-2xl font-bold md:text-3xl`}>Servicios destacados</h2>
          <p className="mt-2 text-sm text-muted-foreground">Soluciones medicas pensadas para una atencion moderna y humanizada.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {serviciosParaMostrar.map((item, idx) => (
              <article key={`${item.titulo}-${idx}`} className="group rounded-2xl border bg-background p-4 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_45px_-30px_hsl(var(--primary))]">
                <p className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  <Star className="size-3" /> Servicio
                </p>
                <h3 className={`${headingFont.className} mt-3 text-lg font-bold`}>{item.titulo}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.descripcion || "Servicio disponible para agendamiento"}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {data.horariosSucursal.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-3xl border border-primary/15 bg-background/75 p-6 md:p-8">
            <h2 className={`${headingFont.className} flex items-center gap-2 text-2xl font-bold md:text-3xl`}>
              <Clock3 className="size-5 text-primary" />
              Horarios de atencion
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {data.horariosSucursal.map((h, idx) => (
                <div key={`${h.diaSemana}-${idx}`} className="rounded-xl border bg-background p-4 text-sm">
                  <p className="font-semibold">{diasSemana[h.diaSemana] ?? `Dia ${h.diaSemana}`}</p>
                  <p className="mt-1 text-muted-foreground">{h.horaInicio || "-"} a {h.horaFin || "-"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-primary/20 bg-primary/10 p-6 md:flex md:items-center md:justify-between md:p-8">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              <Check className="size-3.5" />
              Agenda abierta
            </p>
            <h3 className={`${headingFont.className} mt-2 text-2xl font-bold`}>Listo para reservar tu cita</h3>
            <p className="mt-2 text-sm text-muted-foreground">Confirma disponibilidad en minutos y recibe seguimiento directo del equipo de {data.nombreClinica}.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href={data.ctaPrincipalUrl || "/agendar-cita"}
              className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {data.ctaPrincipalTexto || "Agendar ahora"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
