import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Panel Administrativo",
  robots: {
    index: false, // Sistema interno no indexable
    follow: false,
  },
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-background">
      
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border p-6">
        <h2 className="text-lg font-semibold mb-6">
          Clynic System
        </h2>

        <nav className="space-y-2 text-sm text-muted-foreground">
          <a href="/dashboard" className="block hover:text-primary">
            Dashboard
          </a>
          <a href="/pacientes" className="block hover:text-primary">
            Pacientes
          </a>
          <a href="/citas" className="block hover:text-primary">
            Citas
          </a>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}