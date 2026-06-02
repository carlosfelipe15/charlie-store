"use client"

import { RodiIconMinus, RodiIconPlus } from "@modules/common/icons/rodi"
import { clsx } from "clsx"

type RodiQtyAdderProps = {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  disabled?: boolean
  className?: string
}

export default function RodiQtyAdder({
  quantity,
  onIncrease,
  onDecrease,
  disabled,
  className,
}: RodiQtyAdderProps) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between h-[38px] bg-rm-red text-white rounded-rm-md px-1.5",
        disabled && "opacity-60 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled}
        className="w-8 h-8 rounded-lg border-0 bg-white/20 text-white grid place-items-center cursor-pointer disabled:cursor-not-allowed"
        aria-label="Quitar uno"
      >
        <RodiIconMinus size={14} />
      </button>
      <span className="font-extrabold text-sm tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        className="w-8 h-8 rounded-lg border-0 bg-white/20 text-white grid place-items-center cursor-pointer disabled:cursor-not-allowed"
        aria-label="Añadir uno"
      >
        <RodiIconPlus size={14} />
      </button>
    </div>
  )
}
