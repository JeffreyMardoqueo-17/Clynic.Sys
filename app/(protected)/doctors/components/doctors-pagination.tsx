"use client"

import { Button } from "@/components/ui/button"

type Props = {
  page: number
  totalPages: number
  pageSize: number
  onPageSizeChange: (value: number) => void
  onPrev: () => void
  onNext: () => void
}

export function DoctorsPagination({
  page,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Filas por página</span>
        <select
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border-input bg-background h-8 rounded-md border px-2 text-sm"
        >
          <option value="5">5</option>
          <option value="8">8</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
        <span>
          Página {page} de {totalPages}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
