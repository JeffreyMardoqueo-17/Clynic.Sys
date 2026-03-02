"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, LogIn, Stethoscope, UserRoundPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StatusAlert } from "@/components/components/status-alert"
import { authService } from "@/services/auth.service"

export default function Page() {
  const router = useRouter()
  const [correo, setCorreo] = useState("")
  const [clave, setClave] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState<string | null>(null)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotCorreo, setForgotCorreo] = useState("")
  const [codigo, setCodigo] = useState("")
  const [nuevaClave, setNuevaClave] = useState("")
  const [confirmarClave, setConfirmarClave] = useState("")
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1)
  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const [onboardingError, setOnboardingError] = useState<string | null>(null)

  const [nombreClinica, setNombreClinica] = useState("")
  const [telefonoClinica, setTelefonoClinica] = useState("")
  const [direccionClinica, setDireccionClinica] = useState("")
  const [idClinicaCreada, setIdClinicaCreada] = useState<number | null>(null)

  const [nombreAdmin, setNombreAdmin] = useState("")
  const [correoAdmin, setCorreoAdmin] = useState("")
  const [claveAdmin, setClaveAdmin] = useState("")
  const [confirmarClaveAdmin, setConfirmarClaveAdmin] = useState("")

  const resetOnboardingState = () => {
    setOnboardingStep(1)
    setOnboardingLoading(false)
    setOnboardingError(null)

    setNombreClinica("")
    setTelefonoClinica("")
    setDireccionClinica("")
    setIdClinicaCreada(null)

    setNombreAdmin("")
    setCorreoAdmin("")
    setClaveAdmin("")
    setConfirmarClaveAdmin("")
  }

  const handleOnboardingOpenChange = (open: boolean) => {
    setOnboardingOpen(open)
    if (!open) {
      resetOnboardingState()
    }
  }

  const getSafeNextPath = () => {
    if (typeof window === "undefined") return "/"

    const nextPath = new URLSearchParams(window.location.search).get("next")
    return nextPath && nextPath.startsWith("/") ? nextPath : "/"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await authService.login({
        correo: correo.trim().toLowerCase(),
        clave,
      })

      if (!result.exito) {
        setError(result.mensaje)
        return
      }

      await authService.getProfile()
      router.replace(getSafeNextPath())

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Error inesperado")
      } else {
        setError("Error inesperado")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError(null)
    setForgotMessage(null)
    setForgotLoading(true)

    try {
      const mensaje = await authService.forgotPassword({
        correo: forgotCorreo.trim().toLowerCase(),
      })
      setForgotMessage(mensaje)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setForgotError(err.message || "No se pudo enviar el código")
      } else {
        setForgotError("No se pudo enviar el código")
      }
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError(null)
    setForgotMessage(null)

    if (nuevaClave !== confirmarClave) {
      setForgotError("Las claves no coinciden")
      return
    }

    setForgotLoading(true)

    try {
      const mensaje = await authService.resetPassword({
        correo: forgotCorreo.trim().toLowerCase(),
        codigo: codigo.trim(),
        nuevaClave,
        confirmarClave,
      })

      setForgotMessage(mensaje)
      setCodigo("")
      setNuevaClave("")
      setConfirmarClave("")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setForgotError(err.message || "No se pudo restablecer la contraseña")
      } else {
        setForgotError("No se pudo restablecer la contraseña")
      }
    } finally {
      setForgotLoading(false)
    }
  }

  const handleCrearClinicaStep = async (e: React.FormEvent) => {
    e.preventDefault()
    setOnboardingError(null)

    if (!nombreClinica.trim() || !telefonoClinica.trim() || !direccionClinica.trim()) {
      setOnboardingError("Completa todos los campos de la clínica")
      return
    }

    setOnboardingLoading(true)

    try {
      const clinica = await authService.createOnboardingClinic({
        nombre: nombreClinica.trim(),
        telefono: telefonoClinica.trim(),
        direccion: direccionClinica.trim(),
      })

      setIdClinicaCreada(clinica.id)
      setOnboardingStep(2)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setOnboardingError(err.message || "No se pudo crear la clínica")
      } else {
        setOnboardingError("No se pudo crear la clínica")
      }
    } finally {
      setOnboardingLoading(false)
    }
  }

  const handleCrearCuentaAdminStep = async (e: React.FormEvent) => {
    e.preventDefault()
    setOnboardingError(null)

    if (!idClinicaCreada || idClinicaCreada <= 0) {
      setOnboardingError("Primero debes crear la clínica")
      return
    }

    if (!nombreAdmin.trim() || !correoAdmin.trim() || !claveAdmin) {
      setOnboardingError("Completa todos los campos de la cuenta")
      return
    }

    if (claveAdmin !== confirmarClaveAdmin) {
      setOnboardingError("Las contraseñas no coinciden")
      return
    }

    setOnboardingLoading(true)

    try {
      const result = await authService.register({
        nombreCompleto: nombreAdmin.trim(),
        correo: correoAdmin.trim().toLowerCase(),
        clave: claveAdmin,
        idClinica: idClinicaCreada,
        rol: 1,
      })

      if (!result.exito) {
        setOnboardingError(result.mensaje)
        return
      }

      await authService.getProfile()
      router.replace("/")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setOnboardingError(err.message || "No se pudo crear la cuenta")
      } else {
        setOnboardingError("No se pudo crear la cuenta")
      }
    } finally {
      setOnboardingLoading(false)
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

            <Button
              type="button"
              variant="secondary"
              className="mt-8"
              onClick={() => setOnboardingOpen(true)}
            >
              <Building2 className="mr-2 size-4" />
              Crear clínica
            </Button>
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

            <Button
              type="button"
              variant="outline"
              className="mb-6 w-full"
              onClick={() => setOnboardingOpen(true)}
            >
              <UserRoundPlus className="mr-2 size-4" />
              Crear clínica y cuenta admin
            </Button>

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

              <div className="flex justify-end">
                <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="text-sm text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Recuperar contraseña</DialogTitle>
                      <DialogDescription>
                        Primero solicita un código y luego restablece la contraseña.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleForgotPassword} className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-correo">Correo</Label>
                        <Input
                          id="forgot-correo"
                          type="email"
                          value={forgotCorreo}
                          onChange={(e) => setForgotCorreo(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" variant="outline" className="w-full" disabled={forgotLoading}>
                        {forgotLoading ? "Enviando..." : "Enviar código"}
                      </Button>
                    </form>

                    <form onSubmit={handleResetPassword} className="space-y-3 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="reset-codigo">Código de verificación</Label>
                        <Input
                          id="reset-codigo"
                          value={codigo}
                          onChange={(e) => setCodigo(e.target.value)}
                          minLength={8}
                          maxLength={12}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reset-nueva">Nueva contraseña</Label>
                        <Input
                          id="reset-nueva"
                          type="password"
                          value={nuevaClave}
                          onChange={(e) => setNuevaClave(e.target.value)}
                          minLength={6}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reset-confirmar">Confirmar contraseña</Label>
                        <Input
                          id="reset-confirmar"
                          type="password"
                          value={confirmarClave}
                          onChange={(e) => setConfirmarClave(e.target.value)}
                          minLength={6}
                          required
                        />
                      </div>

                      <DialogFooter>
                        <Button type="submit" className="w-full" disabled={forgotLoading}>
                          {forgotLoading ? "Procesando..." : "Restablecer contraseña"}
                        </Button>
                      </DialogFooter>
                    </form>

                    {forgotError && <StatusAlert type="error" message={forgotError} />}
                    {forgotMessage && <StatusAlert type="success" message={forgotMessage} />}
                  </DialogContent>
                </Dialog>
              </div>

              {error && <StatusAlert type="error" message={error} />}

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

      <Dialog open={onboardingOpen} onOpenChange={handleOnboardingOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {onboardingStep === 1 ? "Paso 1 de 2 · Crear clínica" : "Paso 2 de 2 · Crear cuenta administrador"}
            </DialogTitle>
            <DialogDescription>
              {onboardingStep === 1
                ? "Primero registra tu clínica para habilitar el entorno SaaS."
                : "Ahora crea tu cuenta principal. Se registrará automáticamente con rol Administrador."}
            </DialogDescription>
          </DialogHeader>

          <div className="mb-2 grid grid-cols-2 gap-2 text-sm">
            <div className={`rounded-md border px-3 py-2 ${onboardingStep === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              1. Clínica
            </div>
            <div className={`rounded-md border px-3 py-2 ${onboardingStep === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              2. Cuenta admin
            </div>
          </div>

          {onboardingStep === 1 && (
            <form onSubmit={handleCrearClinicaStep} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="onb-clinica-nombre">Nombre de clínica</Label>
                <Input
                  id="onb-clinica-nombre"
                  value={nombreClinica}
                  onChange={(e) => setNombreClinica(e.target.value)}
                  placeholder="Clínica Central"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-clinica-telefono">Teléfono</Label>
                <Input
                  id="onb-clinica-telefono"
                  value={telefonoClinica}
                  onChange={(e) => setTelefonoClinica(e.target.value)}
                  placeholder="809-000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-clinica-direccion">Dirección</Label>
                <Input
                  id="onb-clinica-direccion"
                  value={direccionClinica}
                  onChange={(e) => setDireccionClinica(e.target.value)}
                  placeholder="Av. Principal #100"
                  required
                />
              </div>

              {onboardingError && <StatusAlert type="error" message={onboardingError} />}

              <DialogFooter>
                <Button type="submit" disabled={onboardingLoading}>
                  {onboardingLoading ? "Creando clínica..." : "Crear clínica y continuar"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {onboardingStep === 2 && (
            <form onSubmit={handleCrearCuentaAdminStep} className="space-y-4">
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                Clínica creada: <strong>{nombreClinica}</strong> (ID {idClinicaCreada})
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-admin-nombre">Nombre completo</Label>
                <Input
                  id="onb-admin-nombre"
                  value={nombreAdmin}
                  onChange={(e) => setNombreAdmin(e.target.value)}
                  placeholder="Nombre del administrador"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-admin-correo">Correo</Label>
                <Input
                  id="onb-admin-correo"
                  type="email"
                  value={correoAdmin}
                  onChange={(e) => setCorreoAdmin(e.target.value)}
                  placeholder="admin@tuclinica.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-admin-clave">Contraseña</Label>
                <Input
                  id="onb-admin-clave"
                  type="password"
                  value={claveAdmin}
                  onChange={(e) => setClaveAdmin(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onb-admin-confirmar">Confirmar contraseña</Label>
                <Input
                  id="onb-admin-confirmar"
                  type="password"
                  value={confirmarClaveAdmin}
                  onChange={(e) => setConfirmarClaveAdmin(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              {onboardingError && <StatusAlert type="error" message={onboardingError} />}

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOnboardingStep(1)}
                  disabled={onboardingLoading}
                >
                  Volver a clínica
                </Button>

                <Button type="submit" disabled={onboardingLoading}>
                  {onboardingLoading ? "Creando cuenta..." : "Finalizar y entrar al panel"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}