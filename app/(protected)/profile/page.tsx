"use client"

import { useEffect, useState } from "react"

import { authService } from "@/services/auth.service"
import { UsuarioResponseDto } from "@/types/auth"

export default function ProfilePage() {
	const [perfil, setPerfil] = useState<UsuarioResponseDto | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

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
				<ProfileItem label="Rol" value={perfil?.rol ?? "-"} />
				<ProfileItem label="Estado" value={perfil?.activo ? "Activo" : "Inactivo"} />
				<ProfileItem label="ID Clínica" value={String(perfil?.idClinica ?? "-")} />
				<ProfileItem label="Clínica" value={perfil?.nombreClinica ?? "Sin clínica"} />
				<ProfileItem label="Fecha creación" value={perfil?.fechaCreacion ?? "-"} />
			</div>
		</section>
	)
}

function ProfileItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-background border-border rounded-lg border p-3">
			<p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
			<p className="text-foreground text-sm font-medium mt-1 break-words">{value}</p>
		</div>
	)
}
