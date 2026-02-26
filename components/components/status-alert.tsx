import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import type * as React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type StatusType = "success" | "error" | "warning" | "info"

type StatusAlertProps = {
  type: StatusType
  message: string
  className?: string
}

const styleByType: Record<StatusType, { icon: React.ComponentType<{ className?: string }>; className: string; variant?: "default" | "destructive" }> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    variant: "default",
  },
  error: {
    icon: AlertCircle,
    className: "border-destructive/40",
    variant: "destructive",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    variant: "default",
  },
  info: {
    icon: Info,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    variant: "default",
  },
}

export function StatusAlert({ type, message, className }: StatusAlertProps) {
  const config = styleByType[type]
  const Icon = config.icon

  return (
    <Alert variant={config.variant} className={cn(config.className, className)}>
      <Icon className="size-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
