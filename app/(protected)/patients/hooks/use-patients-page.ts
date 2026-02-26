"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { normalizeRole } from "@/lib/authorization"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { pacienteService } from "@/services/paciente.service"
import { PacienteResponseDto, UpdateHistorialClinicoDto, UpdatePacienteDto } from "@/types/paciente"

export function usePatientsPage() {
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [idClinica, setIdClinica] = useState(0)
  const [role, setRole] = useState<"Admin" | "Doctor" | "Recepcionista" | "Unknown">("Unknown")

  const [pacientes, setPacientes] = useState<PacienteResponseDto[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteResponseDto | null>(null)

  const [formPaciente, setFormPaciente] = useState<UpdatePacienteDto>({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    fechaNacimiento: "",
  })

  const [formHistorial, setFormHistorial] = useState<UpdateHistorialClinicoDto>({
    enfermedadesPrevias: "",
    medicamentosActuales: "",
    alergias: "",
    antecedentesFamiliares: "",
    observaciones: "",
  })

  const [saveLoading, setSaveLoading] = useState(false)
  const canEditHistorial = role === "Admin" || role === "Doctor"

  const loadPacientes = useCallback(async () => {
    if (!idClinica) return

    try {
      const data = await pacienteService.obtenerPorClinica(idClinica, busqueda)
      setPacientes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar pacientes")
    }
  }, [idClinica, busqueda])

  const init = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const profile = await authService.getProfile()
      setIdClinica(profile.idClinica)
      setRole(normalizeRole(profile.rol))

      const data = await pacienteService.obtenerPorClinica(profile.idClinica)
      setPacientes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la vista")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadPacientes()
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [loadPacientes])

  const openEdit = (paciente: PacienteResponseDto) => {
    setSelectedPaciente(paciente)
    setFormPaciente({
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      correo: paciente.correo,
      telefono: paciente.telefono,
      fechaNacimiento: paciente.fechaNacimiento ? paciente.fechaNacimiento.slice(0, 10) : "",
    })

    setFormHistorial({
      enfermedadesPrevias: paciente.historialClinico?.enfermedadesPrevias ?? "",
      medicamentosActuales: paciente.historialClinico?.medicamentosActuales ?? "",
      alergias: paciente.historialClinico?.alergias ?? "",
      antecedentesFamiliares: paciente.historialClinico?.antecedentesFamiliares ?? "",
      observaciones: paciente.historialClinico?.observaciones ?? "",
    })
  }

  const closeEdit = () => {
    setSelectedPaciente(null)
  }

  const savePaciente = async () => {
    if (!selectedPaciente) return

    setSaveLoading(true)
    setError(null)

    try {
      await pacienteService.actualizar(selectedPaciente.id, {
        nombres: formPaciente.nombres.trim(),
        apellidos: formPaciente.apellidos.trim(),
        correo: formPaciente.correo.trim().toLowerCase(),
        telefono: formPaciente.telefono?.trim(),
        fechaNacimiento: formPaciente.fechaNacimiento || undefined,
      })

      if (canEditHistorial) {
        await pacienteService.guardarHistorial(selectedPaciente.id, {
          enfermedadesPrevias: formHistorial.enfermedadesPrevias?.trim(),
          medicamentosActuales: formHistorial.medicamentosActuales?.trim(),
          alergias: formHistorial.alergias?.trim(),
          antecedentesFamiliares: formHistorial.antecedentesFamiliares?.trim(),
          observaciones: formHistorial.observaciones?.trim(),
        })
      }

      showToast("Paciente actualizado correctamente", "success")
      closeEdit()
      await loadPacientes()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar el paciente"
      setError(message)
      showToast(message, "error")
    } finally {
      setSaveLoading(false)
    }
  }

  const pacientesOrdenados = useMemo(
    () => [...pacientes].sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto)),
    [pacientes]
  )

  return {
    loading,
    error,
    busqueda,
    setBusqueda,
    role,
    canEditHistorial,
    pacientes: pacientesOrdenados,
    selectedPaciente,
    openEdit,
    closeEdit,
    formPaciente,
    setFormPaciente,
    formHistorial,
    setFormHistorial,
    saveLoading,
    savePaciente,
  }
}
