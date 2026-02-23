import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Acceso al sistema clínico Clynic System.",
  robots: {
    index: false, // ❗ Login no debe indexarse
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      {children}
    </div>
  )
}