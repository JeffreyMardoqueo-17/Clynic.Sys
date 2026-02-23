export default function DashboardPage() {
  return (
    <div className="space-y-6">
      
      <header>
        <h1 className="text-3xl font-bold">
          Panel General
        </h1>
        <p className="text-muted-foreground">
          Resumen operativo de la clínica.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm text-muted-foreground">
            Pacientes activos
          </h3>
          <p className="text-2xl font-bold mt-2">128</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm text-muted-foreground">
            Citas hoy
          </h3>
          <p className="text-2xl font-bold mt-2">24</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm text-muted-foreground">
            Ingresos del mes
          </h3>
          <p className="text-2xl font-bold mt-2">$18,540</p>
        </div>

      </div>
    </div>
  )
}