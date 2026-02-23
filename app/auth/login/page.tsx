"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, Stethoscope } from "lucide-react"
import { authService } from "@/services/auth.service"

export default function Page() {
  const router = useRouter()

  const [correo, setCorreo] = useState("")
  const [clave, setClave] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await authService.login({
        correo,
        clave,
      })

      if (!result.exito) {
        setError(result.mensaje)
        return
      }

      // Si todo salió bien, redirigimos al área protegida
      router.push("/") // ajusta según tu ruta protected

    } catch (err: any) {
      setError(err.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-6xl bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-border">

        {/* LADO IZQUIERDO */}
        <div className="relative hidden md:flex flex-col justify-center items-center bg-primary text-primary-foreground p-14">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>

          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-primary-foreground/10 p-4 rounded-2xl backdrop-blur-md">
                <Stethoscope size={40} />
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-6">
              Bienvenido a Clynic System
            </h1>

            <p className="text-lg max-w-md opacity-90 leading-relaxed">
              Plataforma profesional para la gestión de clínicas,
              sucursales y administración médica centralizada.
            </p>
          </div>
        </div>

        {/* LADO DERECHO */}
        <div className="flex items-center justify-center p-10 md:p-14">
          <div className="w-full max-w-sm">

            <h2 className="text-3xl font-bold mb-2 text-foreground">
              Iniciar sesión
            </h2>

            <p className="text-sm text-muted-foreground mb-8">
              Accede al panel administrativo
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@clinica.com"
                  className="h-11"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  className="h-11"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
              >
                <LogIn className="mr-2 size-4" />
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>

            </form>

            <p className="text-xs text-center text-muted-foreground mt-10">
              © 2026 Clynic System
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}