import { Suspense } from "react"
import { ReceptionBoard } from "./components/reception-board"

export default function ReceptionPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando tablero de recepcion...</p>}>
      <ReceptionBoard />
    </Suspense>
  )
}
