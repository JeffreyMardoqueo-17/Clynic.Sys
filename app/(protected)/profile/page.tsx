"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusAlert } from "@/components/components/status-alert"
import { Eye, EyeOff } from "lucide-react"

import { authService } from "@/services/auth.service"
import { UsuarioResponseDto } from "@/types/auth"
import { normalizeRole } from "@/lib/authorization"

type SecurityAction = "none" | "change" | "recover"

export default function ProfilePage() {
	const [perfil, setPerfil] = useState<UsuarioResponseDto | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [securityError, setSecurityError] = useState<string | null>(null)
	const [securityInfo, setSecurityInfo] = useState<string | null>(null)
	const [changingPassword, setChangingPassword] = useState(false)
	const [recoveringPassword, setRecoveringPassword] = useState(false)
	const [securityAction, setSecurityAction] = useState<SecurityAction>("none")

	const [claveActual, setClaveActual] = useState("")
	const [nuevaClave, setNuevaClave] = useState("")
	const [confirmarNuevaClave, setConfirmarNuevaClave] = useState("")

	const [codigoRecuperacion, setCodigoRecuperacion] = useState("")
	const [nuevaClaveRecuperacion, setNuevaClaveRecuperacion] = useState("")
	const [confirmarClaveRecuperacion, setConfirmarClaveRecuperacion] = useState("")
	const [showClaveActual, setShowClaveActual] = useState(false)
	const [showNuevaClave, setShowNuevaClave] = useState(false)
	const [showConfirmarNuevaClave, setShowConfirmarNuevaClave] = useState(false)
	const [showNuevaClaveRecuperacion, setShowNuevaClaveRecuperacion] = useState(false)
	const [showConfirmarClaveRecuperacion, setShowConfirmarClaveRecuperacion] = useState(false)

	useEffect(() => {
		const loadProfile = async () => {
			try {
				setLoading(true)
				setError(null)
				const usuario = await authService.getProfile()
				setPerfil(usuario)
			} catch (err: any) {
				setError(err?.message || "No se pudo cargar el perfil")
			} finally {
				setLoading(false)
			}
		}

		loadProfile()
	}, [])

	useEffect(() => {
		if (perfil?.debeCambiarClave) {
			setSecurityAction("change")
		}
	}, [perfil?.debeCambiarClave])

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault()
		setSecurityError(null)
		setSecurityInfo(null)

		if (!perfil) return

		if (nuevaClave !== confirmarNuevaClave) {
			setSecurityError("Las nuevas claves no coinciden")
			return
		}

		setChangingPassword(true)

		try {
			const mensaje = await authService.changePassword(perfil.id, {
				claveActual,
				nuevaClave,
				confirmarClave: confirmarNuevaClave,
			})

			setClaveActual("")
			setNuevaClave("")
			setConfirmarNuevaClave("")
			setShowClaveActual(false)
			setShowNuevaClave(false)
			setShowConfirmarNuevaClave(false)
			setSecurityInfo(mensaje)
			setPerfil((prev) => (prev ? { ...prev, debeCambiarClave: false } : prev))
			if (typeof window !== "undefined") {
				window.dispatchEvent(new CustomEvent("clynic:password-updated"))
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setSecurityError(err.message || "No se pudo cambiar la contraseña")
			} else {
				setSecurityError("No se pudo cambiar la contraseña")
			}
		} finally {
			setChangingPassword(false)
		}
	}

	const handleSendRecoveryCode = async () => {
		setSecurityError(null)
		setSecurityInfo(null)

		if (!perfil?.correo) {
			setSecurityError("No se encontró el correo del usuario")
			return
		}

		setRecoveringPassword(true)

		try {
			const mensaje = await authService.forgotPassword({ correo: perfil.correo })
			setSecurityInfo(mensaje)
		} catch (err: unknown) {
			if (err instanceof Error) {
				setSecurityError(err.message || "No se pudo enviar el código")
			} else {
				setSecurityError("No se pudo enviar el código")
			}
		} finally {
			setRecoveringPassword(false)
		}
	}

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault()
		setSecurityError(null)
		setSecurityInfo(null)

		if (!perfil?.correo) return

		if (nuevaClaveRecuperacion !== confirmarClaveRecuperacion) {
			setSecurityError("Las claves de recuperación no coinciden")
			return
		}

		setRecoveringPassword(true)

		try {
			const mensaje = await authService.resetPassword({
				correo: perfil.correo,
				codigo: codigoRecuperacion,
				nuevaClave: nuevaClaveRecuperacion,
				confirmarClave: confirmarClaveRecuperacion,
			})

			setCodigoRecuperacion("")
			setNuevaClaveRecuperacion("")
			setConfirmarClaveRecuperacion("")
			setShowNuevaClaveRecuperacion(false)
			setShowConfirmarClaveRecuperacion(false)
			setSecurityInfo(mensaje)
			setPerfil((prev) => (prev ? { ...prev, debeCambiarClave: false } : prev))
			if (typeof window !== "undefined") {
				window.dispatchEvent(new CustomEvent("clynic:password-updated"))
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setSecurityError(err.message || "No se pudo restablecer la contraseña")
			} else {
				setSecurityError("No se pudo restablecer la contraseña")
			}
		} finally {
			setRecoveringPassword(false)
		}
	}

	if (loading) {
		return (
			<section className="space-y-2">
				<h1 className="text-2xl font-bold">Perfil</h1>
				<p className="text-muted-foreground">Cargando información del usuario...</p>
			</section>
		)
	}

	if (error) {
		return (
			<section className="space-y-2">
				<h1 className="text-2xl font-bold">Perfil</h1>
				<p className="text-destructive text-sm">{error}</p>
			</section>
		)
	}

	return (
		<section className="space-y-5">
			<div>
				<h1 className="text-2xl font-bold">Mi perfil</h1>
				<p className="text-muted-foreground text-sm">Información de la sesión actual</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<ProfileItem label="ID" value={String(perfil?.id ?? "-")} />
				<ProfileItem label="Nombre completo" value={perfil?.nombreCompleto ?? "-"} />
				<ProfileItem label="Correo" value={perfil?.correo ?? "-"} />
				<ProfileItem label="Rol" value={normalizeRole(perfil?.rol)} />
				<ProfileItem label="Estado" value={perfil?.activo ? "Activo" : "Inactivo"} />
				<ProfileItem label="Clínica" value={perfil?.nombreClinica ?? "Sin clínica"} />
				<ProfileItem label="Fecha creación" value={perfil?.fechaCreacion ?? "-"} />
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="bg-background border-border rounded-lg border p-4 space-y-3 lg:col-span-2">
					<h2 className="text-base font-semibold">Seguridad</h2>

					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant={securityAction === "change" ? "default" : "outline"}
							onClick={() => setSecurityAction("change")}
						>
							Cambiar contraseña
						</Button>
						<Button
							type="button"
							variant={securityAction === "recover" ? "default" : "outline"}
							onClick={() => setSecurityAction("recover")}
						>
							Olvidé mi contraseña
						</Button>
					</div>

					{securityAction === "none" && (
						<p className="text-sm text-muted-foreground">
							Selecciona la acción que deseas realizar para gestionar tu contraseña.
						</p>
					)}

					{securityAction === "change" && (
						<form onSubmit={handleChangePassword} className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="clave-actual">Clave actual</Label>
								<div className="relative">
									<Input
										id="clave-actual"
										type={showClaveActual ? "text" : "password"}
										value={claveActual}
										onChange={(e) => setClaveActual(e.target.value)}
										className="pr-10"
										required
									/>
									<button
										type="button"
										onClick={() => setShowClaveActual((prev) => !prev)}
										className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
										aria-label={showClaveActual ? "Ocultar contraseña" : "Mostrar contraseña"}
									>
										{showClaveActual ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
									</button>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="nueva-clave">Nueva clave</Label>
								<div className="relative">
									<Input
										id="nueva-clave"
										type={showNuevaClave ? "text" : "password"}
										value={nuevaClave}
										onChange={(e) => setNuevaClave(e.target.value)}
										className="pr-10"
										minLength={6}
										required
									/>
									<button
										type="button"
										onClick={() => setShowNuevaClave((prev) => !prev)}
										className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
										aria-label={showNuevaClave ? "Ocultar contraseña" : "Mostrar contraseña"}
									>
										{showNuevaClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
									</button>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmar-nueva-clave">Confirmar nueva clave</Label>
								<div className="relative">
									<Input
										id="confirmar-nueva-clave"
										type={showConfirmarNuevaClave ? "text" : "password"}
										value={confirmarNuevaClave}
										onChange={(e) => setConfirmarNuevaClave(e.target.value)}
										className="pr-10"
										minLength={6}
										required
									/>
									<button
										type="button"
										onClick={() => setShowConfirmarNuevaClave((prev) => !prev)}
										className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
										aria-label={showConfirmarNuevaClave ? "Ocultar contraseña" : "Mostrar contraseña"}
									>
										{showConfirmarNuevaClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
									</button>
								</div>
							</div>

							<Button type="submit" disabled={changingPassword}>
								{changingPassword ? "Guardando..." : "Actualizar contraseña"}
							</Button>
						</form>
					)}

					{securityAction === "recover" && (
						<div className="space-y-3">
							<p className="text-sm text-muted-foreground">
								Envía un código de recuperación a tu correo y luego establece una nueva clave.
							</p>

							<Button type="button" variant="outline" onClick={handleSendRecoveryCode} disabled={recoveringPassword}>
								{recoveringPassword ? "Enviando..." : "Enviar código a mi correo"}
							</Button>

							<form onSubmit={handleResetPassword} className="space-y-3">
								<div className="space-y-2">
									<Label htmlFor="codigo-recuperacion">Código</Label>
									<Input
										id="codigo-recuperacion"
										value={codigoRecuperacion}
										onChange={(e) => setCodigoRecuperacion(e.target.value)}
										minLength={8}
										maxLength={12}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="nueva-clave-recuperacion">Nueva clave</Label>
									<div className="relative">
										<Input
											id="nueva-clave-recuperacion"
											type={showNuevaClaveRecuperacion ? "text" : "password"}
											value={nuevaClaveRecuperacion}
											onChange={(e) => setNuevaClaveRecuperacion(e.target.value)}
											className="pr-10"
											minLength={6}
											required
										/>
										<button
											type="button"
											onClick={() => setShowNuevaClaveRecuperacion((prev) => !prev)}
											className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
											aria-label={showNuevaClaveRecuperacion ? "Ocultar contraseña" : "Mostrar contraseña"}
										>
											{showNuevaClaveRecuperacion ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirmar-clave-recuperacion">Confirmar nueva clave</Label>
									<div className="relative">
										<Input
											id="confirmar-clave-recuperacion"
											type={showConfirmarClaveRecuperacion ? "text" : "password"}
											value={confirmarClaveRecuperacion}
											onChange={(e) => setConfirmarClaveRecuperacion(e.target.value)}
											className="pr-10"
											minLength={6}
											required
										/>
										<button
											type="button"
											onClick={() => setShowConfirmarClaveRecuperacion((prev) => !prev)}
											className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
											aria-label={showConfirmarClaveRecuperacion ? "Ocultar contraseña" : "Mostrar contraseña"}
										>
											{showConfirmarClaveRecuperacion ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
										</button>
									</div>
								</div>

								<Button type="submit" disabled={recoveringPassword}>
									{recoveringPassword ? "Procesando..." : "Restablecer contraseña"}
								</Button>
							</form>
						</div>
					)}
				</div>
			</div>

			{perfil?.debeCambiarClave && (
				<StatusAlert
					type="warning"
					message="Tu cuenta usa contraseña temporal. Debes cambiarla para continuar de forma segura."
				/>
			)}
			{securityError && <StatusAlert type="error" message={securityError} />}
			{securityInfo && <StatusAlert type="success" message={securityInfo} />}
		</section>
	)
}

function ProfileItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-background border-border rounded-lg border p-3">
			<p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
			<p className="text-foreground text-sm font-medium mt-1 wrap-break-word">{value}</p>
		</div>
	)
}
