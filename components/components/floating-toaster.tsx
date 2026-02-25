"use client"

import { X } from "lucide-react"

import { StatusAlert } from "@/components/components/status-alert"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function FloatingToaster() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-100 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={
            "pointer-events-auto relative transform-gpu transition-all duration-300 " +
            (toast.state === "open"
              ? "translate-y-0 opacity-100"
              : toast.state === "opening"
                ? "translate-y-2 opacity-0"
                : "-translate-y-2 opacity-0")
          }
        >
          <StatusAlert type={toast.type} message={toast.message} className="pr-10 shadow-lg" />
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            className="absolute right-1.5 top-1.5 h-6 w-6"
            onClick={() => dismissToast(toast.id)}
          >
            <X className="size-3.5" />
            <span className="sr-only">Cerrar notificación</span>
          </Button>
        </div>
      ))}
    </div>
  )
}
