"use client"

import { createContext, createElement, useContext, useMemo, useRef, useState } from "react"

export type ToastType = "success" | "error" | "warning" | "info"

type ToastItem = {
  id: string
  type: ToastType
  message: string
  state: "opening" | "open" | "closing"
}

type ToastContextValue = {
  toasts: ToastItem[]
  showToast: (message: string, type?: ToastType) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutMap = useRef<Map<string, number>>(new Map())
  const removeMap = useRef<Map<string, number>>(new Map())

  const dismissToast = (id: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, state: "closing" } : toast
      )
    )

    const timeoutId = timeoutMap.current.get(id)
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutMap.current.delete(id)
    }

    const removeId = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
      removeMap.current.delete(id)
    }, 260)

    removeMap.current.set(id, removeId)
  }

  const showToast = (message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    setToasts((prev) => [...prev, { id, type, message, state: "opening" }])

    window.requestAnimationFrame(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, state: "open" } : toast
        )
      )
    })

    const timeoutId = window.setTimeout(() => {
      dismissToast(id)
    }, 4200)

    timeoutMap.current.set(id, timeoutId)
  }

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts]
  )

  return createElement(ToastContext.Provider, { value }, children)
}

export function useToast() {
  const ctx = useContext(ToastContext)

  if (!ctx) {
    throw new Error("useToast debe usarse dentro de ToastProvider")
  }

  return ctx
}
