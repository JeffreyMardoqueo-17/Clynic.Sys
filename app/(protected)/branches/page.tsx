"use client"

import { BranchCard } from "./components/branch-card"
import { CreateBranchDialog } from "./components/create-branch-dialog"
import { ScheduleConfigDialog } from "./components/schedule-config-dialog"
import { useBranchesSchedule } from "./hooks/use-branches-schedule"
import { Card, CardContent } from "@/components/ui/card"

export default function BranchesPage() {
  const {
    canManage,
    loading,
    error,
    globalInfo,
    sucursales,
    createOpen,
    setCreateOpen,
    createLoading,
    nombreSucursal,
    setNombreSucursal,
    direccionSucursal,
    setDireccionSucursal,
    handleCreateSucursal,
    horarioOpen,
    setHorarioOpen,
    horarioLoading,
    horarioSaving,
    horarioError,
    horarioInfo,
    selectedSucursal,
    configDias,
    updateDay,
    handleGuardarHorarios,
    openHorarioConfig,
    getResumenHorario,
    getResumenAsuetos,
    asuetosExistentes,
    fechaAsueto,
    setFechaAsueto,
    motivoAsueto,
    setMotivoAsueto,
    asuetoLoading,
    handleCrearAsueto,
    handleEliminarAsueto,
  } = useBranchesSchedule()

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando configuración de sucursales...</p>
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="hc-page-title text-3xl font-bold tracking-tight">Sucursales</h1>
          <p className="text-sm text-muted-foreground">
            Administra sucursales, horarios de atención y asuetos de tu clínica.
          </p>
        </div>

        <CreateBranchDialog
          canManage={canManage}
          open={createOpen}
          onOpenChange={setCreateOpen}
          loading={createLoading}
          nombre={nombreSucursal}
          onNombreChange={setNombreSucursal}
          direccion={direccionSucursal}
          onDireccionChange={setDireccionSucursal}
          onSubmit={handleCreateSucursal}
        />
      </header>

      {!canManage && (
        <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          Tu rol solo tiene permisos de consulta en esta vista.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {globalInfo && (
        <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          {globalInfo}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sucursales.map((sucursal) => (
          <BranchCard
            key={sucursal.id}
            sucursal={sucursal}
            canManage={canManage}
            resumenHorario={getResumenHorario(sucursal.id)}
            resumenAsuetos={getResumenAsuetos(sucursal.id)}
            onConfigurarHorarios={openHorarioConfig}
          />
        ))}
      </div>

      {sucursales.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aún no hay sucursales registradas para esta clínica.
          </CardContent>
        </Card>
      )}

      <ScheduleConfigDialog
        open={horarioOpen}
        onOpenChange={setHorarioOpen}
        canManage={canManage}
        loading={horarioLoading}
        saving={horarioSaving}
        error={horarioError}
        info={horarioInfo}
        selectedSucursal={selectedSucursal}
        configDias={configDias}
        onUpdateDay={updateDay}
        onGuardar={handleGuardarHorarios}
        asuetos={asuetosExistentes}
        fechaAsueto={fechaAsueto}
        onFechaAsuetoChange={setFechaAsueto}
        motivoAsueto={motivoAsueto}
        onMotivoAsuetoChange={setMotivoAsueto}
        asuetoLoading={asuetoLoading}
        onCrearAsueto={handleCrearAsueto}
        onEliminarAsueto={handleEliminarAsueto}
      />
    </div>
  )
}
