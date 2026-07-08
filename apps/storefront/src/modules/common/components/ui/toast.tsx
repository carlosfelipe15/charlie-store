"use client"

import clsx from "clsx"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

export type ToastType = "success" | "error" | "info"

type ToastItem = {
  id: number
  message: string
  type: ToastType
}

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const AUTO_DISMISS_MS = 5000

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [mounted, setMounted] = useState(false)
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    setMounted(true)
    const currentTimers = timers.current
    return () => {
      currentTimers.forEach((t) => clearTimeout(t))
      currentTimers.clear()
    }
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = ++nextId
      setToasts((prev) => [...prev, { id, message, type }])
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
      timers.current.set(id, timer)
    },
    [dismiss]
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="fixed bottom-4 right-4 z-[200] flex w-full max-w-[360px] flex-col gap-2 px-4 sm:px-0"
            role="region"
            aria-label="Notificaciones"
          >
            {toasts.map((toast) => (
              <ToastCard
                key={toast.id}
                toast={toast}
                onDismiss={() => dismiss(toast.id)}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: () => void
}) {
  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={clsx(
        "pointer-events-auto flex items-start gap-3 rounded-lg border-[1.5px] bg-rm-paper px-4 py-3 shadow-lg animate-fade-in-top",
        toast.type === "success" && "border-rm-green",
        toast.type === "error" && "border-rm-red",
        toast.type === "info" && "border-rm-line"
      )}
    >
      <span aria-hidden className="mt-0.5 text-base leading-none">
        {toast.type === "success" && "✓"}
        {toast.type === "error" && "⚠"}
        {toast.type === "info" && "ℹ"}
      </span>
      <p className="flex-1 text-sm text-rm-ink">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-rm-ink-4 hover:text-rm-ink transition-colors"
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback no-op: keeps callers safe if a provider isn't mounted on a route.
    return { showToast: () => {} }
  }
  return ctx
}
