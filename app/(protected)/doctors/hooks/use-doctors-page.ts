"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { sucursalService } from "@/services/sucursal.service"
import { usuarioService } from "@/services/usuario.service"
import { EspecialidadDto, EspecialidadSucursalDto, RolDto } from "@/types/auth"
import { SucursalResponseDto } from "@/types/sucursal"
import { UsuarioRol, UsuarioResponseDto } from "@/types/usuario"
import { buildRoleOptions, rolRequiereEspecialidadPorNombre } from "../components/doctors-utils"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function useDoctorsPage() {
  const { showToast } = useToast()
  const [clinicId, setClinicId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [workers, setWorkers] = useState<UsuarioResponseDto[]>([])
  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])
  const [rolesDisponibles, setRolesDisponibles] = useState<RolDto[]>([])
  const [editRolesDisponibles, setEditRolesDisponibles] = useState<RolDto[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const [nombreCompleto, setNombreCompleto] = useState("")
  const [correo, setCorreo] = useState("")
  const [rol, setRol] = useState<UsuarioRol>(0)
  const [idSucursalCrear, setIdSucursalCrear] = useState<string>("")
  const [idEspecialidadCrear, setIdEspecialidadCrear] = useState<string>("")

  const [sucursalFiltro, setSucursalFiltro] = useState<string>("all")
  const [rolFiltro, setRolFiltro] = useState<string>("all")
  const [buscarNombre, setBuscarNombre] = useState("")
  const [showInactive, setShowInactive] = useState(false)

  const [selectedWorker, setSelectedWorker] = useState<UsuarioResponseDto | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [editNombreCompleto, setEditNombreCompleto] = useState("")
  const [editCorreo, setEditCorreo] = useState("")
  const [editRol, setEditRol] = useState<UsuarioRol>(0)
  const [editIdSucursal, setEditIdSucursal] = useState<string>("")
  const [editIdEspecialidad, setEditIdEspecialidad] = useState<string>("")

  const [especialidadesClinica, setEspecialidadesClinica] = useState<EspecialidadDto[]>([])
  const [especialidadesPorSucursal, setEspecialidadesPorSucursal] = useState<EspecialidadSucursalDto[]>([])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  const loadWorkers = useCallback(
    async (idClinica: number, filtroSucursal: string, busqueda: string, inactive: boolean) => {
      const nombre = busqueda.trim() || undefined

      if (inactive) {
        const idSucursal = filtroSucursal === "all" ? undefined : Number(filtroSucursal)
        const inactivos = await usuarioService.obtenerInactivosPorClinica(idClinica, idSucursal, nombre)
        setWorkers(inactivos)
        return
      }

      const usuariosClinica =
        filtroSucursal === "all"
          ? await usuarioService.obtenerPorClinica(idClinica, nombre)
          : await usuarioService.obtenerPorClinicaYSucursal(idClinica, Number(filtroSucursal), nombre)

      setWorkers(usuariosClinica)
    },
    []
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const perfil = await authService.getProfile()
      const perfilRol = String(perfil.nombreRol ?? perfil.rol ?? perfil.idRol ?? "")
      const admin = perfilRol === "Admin" || perfilRol === "1"

      setClinicId(perfil.idClinica)
      setIsAdmin(admin)

      if (!admin) return

      const [sucursalesClinica, especialidadesDoctorClinica] = await Promise.all([
        sucursalService.obtenerPorClinica(perfil.idClinica),
        authService.getDoctorEspecialidadesByClinica(perfil.idClinica),
      ])

      const especialidadesPorSucursalColeccion = await Promise.all(
        sucursalesClinica.map((sucursal) =>
          authService.getDoctorEspecialidadesBySucursal(perfil.idClinica, sucursal.id)
        )
      )

      const especialidadesSucursal = especialidadesPorSucursalColeccion.flat()

      await loadWorkers(perfil.idClinica, "all", "", false)

      setSucursales(sucursalesClinica)
      setEspecialidadesClinica(especialidadesDoctorClinica)
      setEspecialidadesPorSucursal(especialidadesSucursal)
      if (sucursalesClinica.length > 0) {
        const primeraSucursalId = sucursalesClinica[0].id
        setIdSucursalCrear(String(primeraSucursalId))

        const roles = await authService.getRolesBySucursal(perfil.idClinica, primeraSucursalId)
        setRolesDisponibles(roles)

        const rolDoctor = roles.find((item) => item.nombre.toLowerCase() === "doctor")
        const rolDefault = rolDoctor ?? roles[0]
        if (rolDefault) {
          setRol(rolDefault.id)
          setEditRol(rolDefault.id)
          setEditRolesDisponibles(roles)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar trabajadores")
    } finally {
      setLoading(false)
    }
  }, [loadWorkers])

  useEffect(() => {
    if (!clinicId || !isAdmin || !idSucursalCrear) return

    const run = async () => {
      try {
        const roles = await authService.getRolesBySucursal(clinicId, Number(idSucursalCrear))
        setRolesDisponibles(roles)

        if (!roles.some((item) => item.id === rol)) {
          const rolDoctor = roles.find((item) => item.nombre.toLowerCase() === "doctor")
          const rolDefault = rolDoctor ?? roles[0]
          if (rolDefault) {
            setRol(rolDefault.id)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar roles")
      }
    }

    run()
  }, [clinicId, isAdmin, idSucursalCrear, rol])

  useEffect(() => {
    if (!clinicId || !isAdmin || !editOpen || !editIdSucursal) return

    const run = async () => {
      try {
        const roles = await authService.getRolesBySucursal(clinicId, Number(editIdSucursal))
        setEditRolesDisponibles(roles)

        if (!roles.some((item) => item.id === editRol)) {
          const rolDoctor = roles.find((item) => item.nombre.toLowerCase() === "doctor")
          const rolDefault = rolDoctor ?? roles[0]
          if (rolDefault) {
            setEditRol(rolDefault.id)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar roles de edición")
      }
    }

    run()
  }, [clinicId, isAdmin, editOpen, editIdSucursal, editRol])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!clinicId || !isAdmin) return

    const run = async () => {
      try {
        await loadWorkers(clinicId, sucursalFiltro, buscarNombre, showInactive)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo aplicar filtros")
      }
    }

    run()
  }, [clinicId, isAdmin, sucursalFiltro, buscarNombre, showInactive, loadWorkers])

  const workersFiltered = useMemo(() => {
    if (rolFiltro === "all") return workers

    const rolNumero = Number(rolFiltro) as UsuarioRol
    return workers.filter((w) => w.idRol === rolNumero)
  }, [workers, rolFiltro])

  const roleOptions = useMemo(() => buildRoleOptions(rolesDisponibles), [rolesDisponibles])
  const editRoleOptions = useMemo(() => buildRoleOptions(editRolesDisponibles), [editRolesDisponibles])

  const selectedCreateRoleName = useMemo(
    () => rolesDisponibles.find((item) => item.id === rol)?.nombre ?? "",
    [rolesDisponibles, rol]
  )

  const selectedEditRoleName = useMemo(() => {
    const inEditRoles = editRolesDisponibles.find((item) => item.id === editRol)?.nombre
    if (inEditRoles) return inEditRoles
    return rolesDisponibles.find((item) => item.id === editRol)?.nombre ?? ""
  }, [editRolesDisponibles, rolesDisponibles, editRol])

  const especialidadesDisponiblesCrear = useMemo(() => {
    const idSucursal = Number(idSucursalCrear)
    if (!idSucursal || !rolRequiereEspecialidadPorNombre(selectedCreateRoleName)) return []

    return especialidadesPorSucursal.filter((item) => item.idSucursal === idSucursal)
  }, [especialidadesPorSucursal, idSucursalCrear, selectedCreateRoleName])

  const especialidadesDisponiblesEdit = useMemo(() => {
    const idSucursal = Number(editIdSucursal)
    if (!idSucursal || !rolRequiereEspecialidadPorNombre(selectedEditRoleName)) return []

    return especialidadesPorSucursal.filter((item) => item.idSucursal === idSucursal)
  }, [especialidadesPorSucursal, editIdSucursal, selectedEditRoleName])

  useEffect(() => {
    if (!rolRequiereEspecialidadPorNombre(selectedCreateRoleName)) {
      setIdEspecialidadCrear("")
      return
    }

    setIdEspecialidadCrear((prev) => {
      if (prev && especialidadesDisponiblesCrear.some((item) => String(item.idEspecialidad) === prev)) {
        return prev
      }

      return especialidadesDisponiblesCrear[0] ? String(especialidadesDisponiblesCrear[0].idEspecialidad) : ""
    })
  }, [selectedCreateRoleName, especialidadesDisponiblesCrear])

  useEffect(() => {
    if (!rolRequiereEspecialidadPorNombre(selectedEditRoleName)) {
      setEditIdEspecialidad("")
      return
    }

    setEditIdEspecialidad((prev) => {
      if (prev && especialidadesDisponiblesEdit.some((item) => String(item.idEspecialidad) === prev)) {
        return prev
      }

      return especialidadesDisponiblesEdit[0] ? String(especialidadesDisponiblesEdit[0].idEspecialidad) : ""
    })
  }, [selectedEditRoleName, especialidadesDisponiblesEdit])

  useEffect(() => {
    setPage(1)
  }, [workersFiltered.length, pageSize, rolFiltro, sucursalFiltro, buscarNombre, showInactive])

  const totalPages = Math.max(1, Math.ceil(workersFiltered.length / pageSize))

  const correoValido = useMemo(
    () => EMAIL_REGEX.test(correo.trim().toLowerCase()),
    [correo]
  )

  const editCorreoValido = useMemo(
    () => EMAIL_REGEX.test(editCorreo.trim().toLowerCase()),
    [editCorreo]
  )

  const paginatedWorkers = useMemo(() => {
    const start = (page - 1) * pageSize
    return workersFiltered.slice(start, start + pageSize)
  }, [workersFiltered, page, pageSize])

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clinicId) return

    const roleName = selectedCreateRoleName.toLowerCase()
    const requiereEspecialidad = rolRequiereEspecialidadPorNombre(selectedCreateRoleName)

    const idSucursal = Number(idSucursalCrear)
    if (roleName !== "admin" && (!idSucursal || idSucursal <= 0)) {
      const message = "Debes seleccionar una sucursal"
      setError(message)
      showToast(message, "warning")
      return
    }

    if (!correoValido) {
      const message = "Ingresa un correo válido para crear el trabajador"
      setError(message)
      showToast(message, "warning")
      return
    }

    const idEspecialidad = Number(idEspecialidadCrear)
    if (requiereEspecialidad && (!idEspecialidad || idEspecialidad <= 0)) {
      const message = "Debes seleccionar una especialidad para el profesional"
      setError(message)
      showToast(message, "warning")
      return
    }

    setCreateLoading(true)
    setError(null)

    try {
      await usuarioService.crear({
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim().toLowerCase(),
        idClinica: clinicId,
        idSucursal: roleName === "admin" ? undefined : idSucursal,
        idRol: rol,
        idEspecialidad: requiereEspecialidad ? idEspecialidad : undefined,
      })

      setNombreCompleto("")
      setCorreo("")
      const rolDoctor = rolesDisponibles.find((item) => item.nombre.toLowerCase() === "doctor")
      if (rolDoctor) {
        setRol(rolDoctor.id)
      }
      setIdEspecialidadCrear("")
      setCreateOpen(false)

      await loadWorkers(clinicId, sucursalFiltro, buscarNombre, showInactive)
      showToast("Trabajador creado. Se envió contraseña temporal al correo.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el trabajador"
      setError(message)
      showToast(message, "error")
    } finally {
      setCreateLoading(false)
    }
  }

  const openView = (worker: UsuarioResponseDto) => {
    setSelectedWorker(worker)
    setViewOpen(true)
  }

  const openEdit = (worker: UsuarioResponseDto) => {
    setSelectedWorker(worker)
    setEditNombreCompleto(worker.nombreCompleto)
    setEditCorreo(worker.correo)
    setEditRol(worker.idRol)
    setEditIdSucursal(worker.idSucursal ? String(worker.idSucursal) : "")
    setEditIdEspecialidad(worker.idEspecialidad ? String(worker.idEspecialidad) : "")
    setEditRolesDisponibles([])
    setEditOpen(true)
  }

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedWorker) return

    const roleName = selectedEditRoleName.toLowerCase()
    const requiereEspecialidad = rolRequiereEspecialidadPorNombre(selectedEditRoleName)
    const idSucursal = Number(editIdSucursal)

    if (!editRolesDisponibles.some((item) => item.id === editRol)) {
      const message = "El rol seleccionado no pertenece a la sucursal indicada"
      setError(message)
      showToast(message, "warning")
      return
    }

    if (roleName !== "admin" && (!idSucursal || idSucursal <= 0)) {
      const message = "Debes seleccionar una sucursal válida"
      setError(message)
      showToast(message, "warning")
      return
    }

    if (!editCorreoValido) {
      const message = "Ingresa un correo válido para actualizar el trabajador"
      setError(message)
      showToast(message, "warning")
      return
    }

    const idEspecialidad = Number(editIdEspecialidad)
    if (requiereEspecialidad && (!idEspecialidad || idEspecialidad <= 0)) {
      const message = "Debes seleccionar una especialidad para el profesional"
      setError(message)
      showToast(message, "warning")
      return
    }

    setActionLoading(true)
    setError(null)

    try {
      await usuarioService.actualizar(selectedWorker.id, {
        nombreCompleto: editNombreCompleto.trim(),
        correo: editCorreo.trim().toLowerCase(),
        idSucursal: roleName === "admin" ? undefined : idSucursal,
        idRol: editRol,
        idEspecialidad: requiereEspecialidad ? idEspecialidad : undefined,
      })

      if (clinicId) {
        await loadWorkers(clinicId, sucursalFiltro, buscarNombre, showInactive)
      }

      setEditOpen(false)
      showToast("Trabajador actualizado correctamente.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el trabajador"
      setError(message)
      showToast(message, "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteWorker = async (worker: UsuarioResponseDto) => {
    const ok = window.confirm(`¿Deseas desactivar a ${worker.nombreCompleto}?`)
    if (!ok) return

    setActionLoading(true)
    setError(null)

    try {
      await usuarioService.eliminar(worker.id)
      if (clinicId) {
        await loadWorkers(clinicId, sucursalFiltro, buscarNombre, showInactive)
      }
      showToast("Trabajador desactivado correctamente.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo desactivar el trabajador"
      setError(message)
      showToast(message, "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateWorker = async (worker: UsuarioResponseDto) => {
    const ok = window.confirm(`¿Deseas reactivar a ${worker.nombreCompleto}?`)
    if (!ok) return

    setActionLoading(true)
    setError(null)

    try {
      await usuarioService.actualizar(worker.id, { activo: true })
      if (clinicId) {
        await loadWorkers(clinicId, sucursalFiltro, buscarNombre, showInactive)
      }
      showToast("Trabajador reactivado correctamente.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo reactivar el trabajador"
      setError(message)
      showToast(message, "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleResendInvitation = async (worker: UsuarioResponseDto) => {
    const ok = window.confirm(`¿Reenviar invitación y contraseña temporal a ${worker.nombreCompleto}?`)
    if (!ok) return

    setActionLoading(true)
    setError(null)

    try {
      await usuarioService.reenviarInvitacion(worker.id)
      if (clinicId) {
        await loadWorkers(clinicId, sucursalFiltro, buscarNombre, showInactive)
      }
      showToast("Invitación reenviada. El usuario recibirá nueva contraseña temporal.", "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo reenviar la invitación"
      setError(message)
      showToast(message, "error")
    } finally {
      setActionLoading(false)
    }
  }

  return {
    loading,
    error,
    isAdmin,
    sucursales,
    roleOptions,
    editRoleOptions,
    selectedCreateRoleName,
    selectedEditRoleName,
    createOpen,
    setCreateOpen,
    createLoading,
    nombreCompleto,
    setNombreCompleto,
    correo,
    correoValido,
    setCorreo,
    rol,
    setRol,
    idSucursalCrear,
    setIdSucursalCrear,
    idEspecialidadCrear,
    setIdEspecialidadCrear,
    especialidadesDisponiblesCrear,
    especialidadesClinica,
    sucursalFiltro,
    setSucursalFiltro,
    rolFiltro,
    setRolFiltro,
    buscarNombre,
    setBuscarNombre,
    showInactive,
    setShowInactive,
    paginatedWorkers,
    workersFiltered,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    selectedWorker,
    viewOpen,
    setViewOpen,
    editOpen,
    setEditOpen,
    actionLoading,
    editNombreCompleto,
    setEditNombreCompleto,
    editCorreo,
    editCorreoValido,
    setEditCorreo,
    editRol,
    setEditRol,
    editIdSucursal,
    setEditIdSucursal,
    editIdEspecialidad,
    setEditIdEspecialidad,
    especialidadesDisponiblesEdit,
    handleCreateWorker,
    openView,
    openEdit,
    handleUpdateWorker,
    handleDeleteWorker,
    handleReactivateWorker,
    handleResendInvitation,
  }
}
