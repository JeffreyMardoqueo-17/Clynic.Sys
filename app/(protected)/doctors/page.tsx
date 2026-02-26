"use client"

import { BriefcaseMedical } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateWorkerDialog } from "./components/create-worker-dialog"
import { DoctorViewDialog } from "./components/doctor-view-dialog"
import { DoctorsFilters } from "./components/doctors-filters"
import { DoctorsPagination } from "./components/doctors-pagination"
import { DoctorsTable } from "./components/doctors-table"
import { EditWorkerDialog } from "./components/edit-worker-dialog"
import { useDoctorsPage } from "./hooks/use-doctors-page"

export default function DoctorsPage() {
  const {
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
  } = useDoctorsPage()

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando trabajadores...</p>
  }

  if (!isAdmin) {
    return (
      <Card bordered={false} shadow={false}>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Esta sección es solo para administradores.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="hc-page-title text-3xl font-bold tracking-tight">Trabajadores</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona doctores y recepcionistas con acciones rápidas desde la tabla.
          </p>
        </div>

        <CreateWorkerDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          loading={createLoading}
          nombreCompleto={nombreCompleto}
          onNombreCompletoChange={setNombreCompleto}
          correo={correo}
          onCorreoChange={setCorreo}
          rol={rol}
          onRolChange={setRol}
          idSucursalCrear={idSucursalCrear}
          onIdSucursalCrearChange={setIdSucursalCrear}
          sucursales={sucursales}
          onSubmit={handleCreateWorker}
        />
      </header>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <DoctorsFilters
        sucursales={sucursales}
        rolFiltro={rolFiltro}
        onRolFiltroChange={setRolFiltro}
        sucursalFiltro={sucursalFiltro}
        onSucursalFiltroChange={setSucursalFiltro}
        buscarNombre={buscarNombre}
        onBuscarNombreChange={setBuscarNombre}
        showInactive={showInactive}
        onToggleInactive={() => setShowInactive((prev) => !prev)}
      />

      <Card className="hc-soft-card" bordered={false} shadow={false}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Listado de trabajadores</CardTitle>
          <CardDescription>
            {workersFiltered.length} registro(s) encontrado(s) {showInactive ? "inactivos" : "activos"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <DoctorsTable
            data={paginatedWorkers}
            showInactive={showInactive}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDeleteWorker}
            onReactivate={handleReactivateWorker}
          />

          <DoctorsPagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          />
        </CardContent>
      </Card>

      <Card bordered={false} shadow={false}>
        <CardContent className="flex items-start gap-2 py-4 text-sm text-muted-foreground">
          <BriefcaseMedical className="mt-0.5 size-4" />
          El botón eliminar realiza desactivación lógica (soft delete) desde backend.
        </CardContent>
      </Card>

      <DoctorViewDialog open={viewOpen} usuario={selectedWorker} onOpenChange={setViewOpen} />

      <EditWorkerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdateWorker}
        submitting={actionLoading}
        nombreCompleto={editNombreCompleto}
        onNombreCompletoChange={setEditNombreCompleto}
        correo={editCorreo}
        onCorreoChange={setEditCorreo}
        rol={editRol}
        onRolChange={setEditRol}
        idSucursal={editIdSucursal}
        onIdSucursalChange={setEditIdSucursal}
        sucursales={sucursales}
      />
    </div>
  )
}
