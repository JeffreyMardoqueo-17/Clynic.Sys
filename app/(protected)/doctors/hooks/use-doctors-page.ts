"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/auth.service"
import { sucursalService } from "@/services/sucursal.service"
import { usuarioService } from "@/services/usuario.service"
import { SucursalResponseDto } from "@/types/sucursal"
import { UsuarioRol, UsuarioResponseDto } from "@/types/usuario"

export function useDoctorsPage() {
  const { showToast } = useToast()
  const [clinicId, setClinicId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [workers, setWorkers] = useState<UsuarioResponseDto[]>([])
  const [sucursales, setSucursales] = useState<SucursalResponseDto[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const [nombreCompleto, setNombreCompleto] = useState("")
  const [correo, setCorreo] = useState("")
  const [rol, setRol] = useState<UsuarioRol>(2)
  const [idSucursalCrear, setIdSucursalCrear] = useState<string>("")

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
  const [editRol, setEditRol] = useState<UsuarioRol>(2)
  const [editIdSucursal, setEditIdSucursal] = useState<string>("")

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
      const perfilRol = String(perfil.rol)
      const admin = perfilRol === "Admin" || perfilRol === "1"

      setClinicId(perfil.idClinica)
      setIsAdmin(admin)

      if (!admin) return

      const sucursalesClinica = await sucursalService.obtenerPorClinica(perfil.idClinica)
      await loadWorkers(perfil.idClinica, "all", "", false)

      setSucursales(sucursalesClinica)
      if (sucursalesClinica.length > 0) {
        setIdSucursalCrear(String(sucursalesClinica[0].id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar trabajadores")
    } finally {
      setLoading(false)
    }
  }, [loadWorkers])

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
    const sinAdmins = workers.filter((w) => w.rol !== 1)

    if (rolFiltro === "all") return sinAdmins

    const rolNumero = Number(rolFiltro) as UsuarioRol
    return sinAdmins.filter((w) => w.rol === rolNumero)
  }, [workers, rolFiltro])

  useEffect(() => {
    setPage(1)
  }, [workersFiltered.length, pageSize, rolFiltro, sucursalFiltro, buscarNombre, showInactive])

  const totalPages = Math.max(1, Math.ceil(workersFiltered.length / pageSize))

  const paginatedWorkers = useMemo(() => {
    const start = (page - 1) * pageSize
    return workersFiltered.slice(start, start + pageSize)
  }, [workersFiltered, page, pageSize])

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clinicId) return

    const idSucursal = Number(idSucursalCrear)
    if (!idSucursal || idSucursal <= 0) {
      const message = "Debes seleccionar una sucursal"
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
        idSucursal,
        rol,
      })

      setNombreCompleto("")
      setCorreo("")
      setRol(2)
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
    setEditRol(worker.rol === 1 ? 2 : worker.rol)
    setEditIdSucursal(worker.idSucursal ? String(worker.idSucursal) : "")
    setEditOpen(true)
  }

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedWorker) return

    const idSucursal = Number(editIdSucursal)
    if (!idSucursal || idSucursal <= 0) {
      const message = "Debes seleccionar una sucursal válida"
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
        idSucursal,
        rol: editRol,
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

  return {
    loading,
    error,
    isAdmin,
    sucursales,
    createOpen,
    setCreateOpen,
    createLoading,
    nombreCompleto,
    setNombreCompleto,
    correo,
    setCorreo,
    rol,
    setRol,
    idSucursalCrear,
    setIdSucursalCrear,
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
    setEditCorreo,
    editRol,
    setEditRol,
    editIdSucursal,
    setEditIdSucursal,
    handleCreateWorker,
    openView,
    openEdit,
    handleUpdateWorker,
    handleDeleteWorker,
    handleReactivateWorker,
  }
}
