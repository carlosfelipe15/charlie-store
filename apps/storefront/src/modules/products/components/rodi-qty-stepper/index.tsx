"use client"

import { RodiIconMinus, RodiIconPlus } from "@modules/common/icons/rodi"
import { clsx } from "clsx"

type RodiQtyStepperProps = {
  quantity: number
  onChange: (qty: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: "md" | "lg"
}

export default function RodiQtyStepper({
  quantity,
  onChange,
  min = 1,
  max = 99,
  disabled,
  size = "lg",
}: RodiQtyStepperProps) {
  const h = size === "lg" ? "h-[52px]" : "h-10"

  return (
    <div
      className={clsx(
        "flex items-center border-[1.5px] border-rm-line rounded-rm-md bg-rm-paper",
        h,
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={disabled || quantity <= min}
        className="w-11 h-full grid place-items-center text-rm-ink"
        aria-label="Reducir cantidad"
      >
        <RodiIconMinus size={16} />
      </button>
      <span className="min-w-[36px] text-center font-extrabold text-base tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={disabled || quantity >= max}
        className="w-11 h-full grid place-items-center text-rm-ink"
        aria-label="Aumentar cantidad"
      >
        <RodiIconPlus size={16} />
      </button>
    </div>
  )
}
