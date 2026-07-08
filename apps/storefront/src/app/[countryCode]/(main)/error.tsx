"use client"

import { RodiBtnLink } from "@modules/common/components/rodi"
import { useEffect } from "react"

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col gap-4 items-center justify-center text-center min-h-[calc(100vh-64px)] px-6">
      <h1 className="font-display text-2xl font-extrabold text-rm-ink">
        Algo salió mal
      </h1>
      <p className="text-sm text-rm-ink-2 max-w-sm">
        No pudimos cargar esta página. Puedes intentarlo de nuevo o volver al
        inicio.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="text-sm font-bold text-rm-ink underline underline-offset-2"
        >
          Reintentar
        </button>
        <RodiBtnLink href="/" kind="dark" size="sm">
          Ir al inicio
        </RodiBtnLink>
      </div>
    </div>
  )
}
