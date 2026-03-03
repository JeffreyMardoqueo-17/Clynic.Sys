"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { normalizeRole } from "@/lib/authorization"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { citaService } from "@/services/cita.service"
import { citaServicioService } from "@/services/cita-servicio.service"
import { servicioService } from "@/services/servicio.service"
import { CitaServicioResponseDto } from "@/types/cita-servicio"
import { CitaResponseDto } from "@/types/cita"
import { ServicioResponseDto } from "@/types/servicio"

export function useAppointmentServicesPage() {
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [role, setRole] = useState<"Admin" | "Doctor" | "Recepcionista" | "Unknown">("Unknown")
  const [idClinica, setIdClinica] = useState(0)

  const [citas, setCitas] = useState<CitaResponseDto[]>([])
  const [serviciosDisponibles, setServiciosDisponibles] = useState<ServicioResponseDto[]>([])
  const [detalles, setDetalles] = useState<CitaServicioResponseDto[]>([])

  const [idCitaSeleccionada, setIdCitaSeleccionada] = useState(0)
  const [idServicioCrear, setIdServicioCrear] = useState(0)
  const [duracionMinCrear, setDuracionMinCrear] = useState("")
  const [precioCrear, setPrecioCrear] = useState("")

  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const canEdit = role === "Admin" || role === "Recepcionista"

  const loadDetalles = useCallback(async (idCita: number) => {
    if (!idCita) {
      setDetalles([])
      return
    }

    const data = await citaServicioService.obtenerPorCita(idCita)
    setDetalles(data)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const profile = await authService.getProfile()
      const normalizedRole = normalizeRole(profile.rol)

      setRole(normalizedRole)
      setIdClinica(profile.idClinica)

      const [citasData, serviciosData] = await Promise.all([
        citaService.obtenerPorClinica(profile.idClinica),
        servicioService.obtenerPorClinica(profile.idClinica),
      ])

      const citasOrdenadas = [...citasData].sort(
        (a, b) => new Date(b.fechaHoraInicioPlan).getTime() - new Date(a.fechaHoraInicioPlan).getTime()
      )

      setCitas(citasOrdenadas)
      setServiciosDisponibles(serviciosData.filter((servicio) => servicio.activo))

      const idInicial = citasOrdenadas[0]?.id ?? 0
      setIdCitaSeleccionada(idInicial)

      if (idInicial > 0) {
        await loadDetalles(idInicial)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la vista de cita servicios")
    } finally {
      setLoading(false)
    }
  }, [loadDetalles])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!idCitaSeleccionada) {
      setDetalles([])
      return
    }

    loadDetalles(idCitaSeleccionada).catch((err) => {
      setError(err instanceof Error ? err.message : "No se pudo cargar el detalle de la cita")
    })
  }, [idCitaSeleccionada, loadDetalles])

  const citaSeleccionada = useMemo(
    () => citas.find((cita) => cita.id === idCitaSeleccionada) ?? null,
    [citas, idCitaSeleccionada]
  )

  const crearDetalle = async () => {
    if (!canEdit) {
      showToast("No tienes permisos para agregar servicios", "warning")
      return
    }

    if (!idCitaSeleccionada || !idServicioCrear) {
      showToast("Selecciona cita y servicio", "warning")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const duracionMin = duracionMinCrear.trim() ? Number(duracionMinCrear) : undefined
      const precio = precioCrear.trim() ? Number(precioCrear) : undefined

      await citaServicioService.crear({
        idCita: idCitaSeleccionada,
        idServicio: idServicioCrear,
        duracionMin,
        precio,
      })

      showToast("Servicio agregado a la cita", "success")
      setDuracionMinCrear("")
      setPrecioCrear("")
      await loadDetalles(idCitaSeleccionada)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo agregar el servicio"
      setError(message)
      showToast(message, "error")
    } finally {
      setSaving(false)
    }
  }

  const eliminarDetalle = async (idCitaServicio: number) => {
    if (!canEdit) {
      showToast("No tienes permisos para eliminar servicios", "warning")
      return
    }

    setRemovingId(idCitaServicio)
    setError(null)

    try {
      await citaServicioService.eliminar(idCitaServicio)
      showToast("Servicio eliminado de la cita", "success")
      await loadDetalles(idCitaSeleccionada)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar el servicio"
      setError(message)
      showToast(message, "error")
    } finally {
      setRemovingId(null)
    }
  }

  return {
    loading,
    error,
    role,
    idClinica,
    canEdit,
    citas,
    citaSeleccionada,
    detalles,
    serviciosDisponibles,
    idCitaSeleccionada,
    setIdCitaSeleccionada,
    idServicioCrear,
    setIdServicioCrear,
    duracionMinCrear,
    setDuracionMinCrear,
    precioCrear,
    setPrecioCrear,
    saving,
    removingId,
    crearDetalle,
    eliminarDetalle,
  }
}
