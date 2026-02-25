import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 md:p-8">
      <section className="w-full max-w-5xl rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm backdrop-blur md:p-10">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="order-2 space-y-4 text-center md:order-1 md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-destructive">
              <AlertTriangle className="size-3.5" />
              Advertencia crítica
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Error 404: área no disponible
            </h1>

            <p className="text-sm text-muted-foreground md:text-base">
              La ruta solicitada no corresponde a un módulo válido de Clynic System.
              Verifica el enlace o vuelve a una sección segura del sistema clínico.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
              <Button asChild>
                <Link href="/">Volver al panel</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/login">Ir a inicio de sesión</Link>
              </Button>
            </div>
          </div>

          <div className="order-1 flex justify-center md:order-2">
            <img
              src="/svgs/not_found.svg"
              alt="Ilustración de página no encontrada"
              className="w-full max-w-md rounded-2xl"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
