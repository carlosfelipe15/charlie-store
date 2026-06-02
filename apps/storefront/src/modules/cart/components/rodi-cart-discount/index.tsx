"use client"

import { applyPromotions } from "@lib/data/cart"
import { RodiBtn } from "@modules/common/components/rodi"
import { HttpTypes } from "@medusajs/types"
import { FormEvent, useState } from "react"

type RodiCartDiscountProps = {
  cart: HttpTypes.StoreCart
}

export default function RodiCartDiscount({ cart }: RodiCartDiscountProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setPending(true)
    setError("")
    const codes = (cart.promotions ?? [])
      .filter((p) => p.code)
      .map((p) => p.code!)

    try {
      await applyPromotions([...codes, code.trim()])
      setCode("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cupón no válido")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mb-4">
      <form onSubmit={(e) => void onSubmit(e)} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Cupón o código"
          className="flex-1 h-[42px] px-3 border-[1.5px] border-rm-line rounded-lg text-sm outline-none focus:border-rm-ink bg-rm-paper"
          data-testid="discount-input"
        />
        <RodiBtn
          type="submit"
          kind="dark"
          size="md"
          disabled={pending}
          data-testid="discount-apply-button"
        >
          Aplicar
        </RodiBtn>
      </form>
      {error && (
        <p className="text-xs text-rm-red mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
