import { PublicAppointmentForm } from "@/app/agendar-cita/components/public-appointment-form"

type PublicAppointmentPageProps = {
  searchParams?: {
    clinica?: string
  }
}

export default function PublicAppointmentPage({ searchParams }: PublicAppointmentPageProps) {
  const clinicaId = searchParams?.clinica ? Number(searchParams.clinica) : undefined
  const initialClinicaId = Number.isFinite(clinicaId) && (clinicaId ?? 0) > 0 ? clinicaId : undefined

  return <PublicAppointmentForm initialClinicaId={initialClinicaId} />
}
