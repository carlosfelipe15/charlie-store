"use client"

import { RodiBtnLink } from "@modules/common/components/rodi"
import { useEffect } from "react"

export default function CheckoutError({
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
    <div className="flex flex-col gap-4 items-center justify-center text-center min-h-[60vh] px-6">
      <h1 className="font-display text-2xl font-extrabold text-rm-ink">
        No pudimos continuar con tu pedido
      </h1>
      <p className="text-sm text-rm-ink-2 max-w-sm">
        Ocurrió un error durante el checkout. Tu carrito sigue guardado —
        puedes intentarlo de nuevo.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="text-sm font-bold text-rm-ink underline underline-offset-2"
        >
          Reintentar
        </button>
        <RodiBtnLink href="/cart" kind="dark" size="sm">
          Volver al carrito
        </RodiBtnLink>
      </div>
    </div>
  )
}
