"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { normalizeRole } from "@/lib/authorization"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { historialClinicoService } from "@/services/historial-clinico.service"
import { pacienteService } from "@/services/paciente.service"
import { PacienteResponseDto } from "@/types/paciente"
import { HistorialClinicoResponseDto, UpsertHistorialClinicoDto } from "@/types/historial-clinico"

type HistorialFormState = Required<UpsertHistorialClinicoDto>

const emptyForm: HistorialFormState = {
  enfermedadesPrevias: "",
  medicamentosActuales: "",
  alergias: "",
  antecedentesFamiliares: "",
  observaciones: "",
}

export function useRecordsPage() {
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [role, setRole] = useState<"Admin" | "Doctor" | "Recepcionista" | "Unknown">("Unknown")
  const [idClinica, setIdClinica] = useState(0)
  const [busqueda, setBusqueda] = useState("")

  const [pacientes, setPacientes] = useState<PacienteResponseDto[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteResponseDto | null>(null)
  const [historialActual, setHistorialActual] = useState<HistorialClinicoResponseDto | null>(null)
  const [formHistorial, setFormHistorial] = useState<HistorialFormState>(emptyForm)

  const [saveLoading, setSaveLoading] = useState(false)
  const canEdit = role === "Admin" || role === "Doctor"

  const loadPacientes = useCallback(async (idClinicaTarget: number, term?: string) => {
    const data = await pacienteService.obtenerPorClinica(idClinicaTarget, term)
    setPacientes(data)
    return data
  }, [])

  const loadHistorial = useCallback(async (idPaciente: number) => {
    try {
      const historial = await historialClinicoService.obtenerPorPaciente(idPaciente)
      setHistorialActual(historial)
      setFormHistorial({
        enfermedadesPrevias: historial.enfermedadesPrevias ?? "",
        medicamentosActuales: historial.medicamentosActuales ?? "",
        alergias: historial.alergias ?? "",
        antecedentesFamiliares: historial.antecedentesFamiliares ?? "",
        observaciones: historial.observaciones ?? "",
      })
    } catch {
      setHistorialActual(null)
      setFormHistorial(emptyForm)
    }
  }, [])

  const init = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const profile = await authService.getProfile()
      const normalizedRole = normalizeRole(profile.rol)

      setRole(normalizedRole)
      setIdClinica(profile.idClinica)

      const pacientesData = await loadPacientes(profile.idClinica)
      if (pacientesData.length > 0) {
        setSelectedPaciente(pacientesData[0])
        await loadHistorial(pacientesData[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la vista de historial clínico")
    } finally {
      setLoading(false)
    }
  }, [loadHistorial, loadPacientes])

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (!idClinica) return

    const timeout = window.setTimeout(async () => {
      try {
        const data = await loadPacientes(idClinica, busqueda)
        if (selectedPaciente && !data.some((p) => p.id === selectedPaciente.id)) {
          setSelectedPaciente(null)
          setHistorialActual(null)
          setFormHistorial(emptyForm)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los pacientes")
      }
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [busqueda, idClinica, loadPacientes, selectedPaciente])

  const selectPaciente = async (paciente: PacienteResponseDto) => {
    setSelectedPaciente(paciente)
    await loadHistorial(paciente.id)
  }

  const guardarHistorial = async () => {
    if (!selectedPaciente) {
      showToast("Selecciona un paciente", "warning")
      return
    }

    if (!canEdit) {
      showToast("No tienes permisos para editar historial clínico", "warning")
      return
    }

    setSaveLoading(true)
    setError(null)

    try {
      const saved = await historialClinicoService.guardar(selectedPaciente.id, {
        enfermedadesPrevias: formHistorial.enfermedadesPrevias.trim(),
        medicamentosActuales: formHistorial.medicamentosActuales.trim(),
        alergias: formHistorial.alergias.trim(),
        antecedentesFamiliares: formHistorial.antecedentesFamiliares.trim(),
        observaciones: formHistorial.observaciones.trim(),
      })

      setHistorialActual(saved)
      showToast("Historial clínico guardado correctamente", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar el historial clínico"
      setError(message)
      showToast(message, "error")
    } finally {
      setSaveLoading(false)
    }
  }

  const pacientesFiltrados = useMemo(
    () => [...pacientes].sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)),
    [pacientes]
  )

  return {
    loading,
    error,
    role,
    canEdit,
    busqueda,
    setBusqueda,
    pacientes: pacientesFiltrados,
    selectedPaciente,
    selectPaciente,
    historialActual,
    formHistorial,
    setFormHistorial,
    saveLoading,
    guardarHistorial,
  }
}
