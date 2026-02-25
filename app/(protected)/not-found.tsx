import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProtectedNotFoundPage() {
  return (
    <section className="h-full min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-4xl rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm backdrop-blur md:p-10">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
          <div className="order-2 space-y-3 text-center md:order-1 md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-destructive">
              <AlertTriangle className="size-3.5" />
              Advertencia de ruta
            </div>

            <h1 className="text-2xl font-bold md:text-3xl">Ruta no válida en el panel clínico</h1>

            <p className="text-sm text-muted-foreground">
              Este endpoint no existe dentro de los módulos habilitados para tu clínica.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Button asChild>
                <Link href="/">Volver al panel</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/appointment">Ir a citas</Link>
              </Button>
            </div>
          </div>

          <div className="order-1 flex justify-center md:order-2">
            <img
              src="/svgs/not_found.svg"
              alt="Ilustración de módulo no encontrado"
              className="w-full max-w-sm rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
