import { Suspense } from "react"
import { AppointmentManagement } from "@/app/(protected)/appointment/components/appointment-management"

export default function AppointmentPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando modulo de citas...</p>}>
      <AppointmentManagement />
    </Suspense>
  )
}