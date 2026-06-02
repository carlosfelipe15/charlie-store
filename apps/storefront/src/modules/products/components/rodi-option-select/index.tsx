"use client"

import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"

type RodiOptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

export default function RodiOptionSelect({
  option,
  current,
  updateOption,
  title,
  disabled,
  "data-testid": dataTestId,
}: RodiOptionSelectProps) {
  const values = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-2" data-testid={dataTestId}>
      <div className="text-xs font-extrabold text-rm-ink uppercase tracking-widest">
        {title}:{" "}
        <span className="text-rm-ink-2 font-semibold normal-case tracking-normal">
          {current ?? "—"}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => {
          const selected = v === current
          return (
            <button
              key={v}
              type="button"
              onClick={() => updateOption(option.id, v)}
              disabled={disabled}
              data-testid="option-button"
              className={clsx(
                "px-3.5 py-2 rounded-lg text-[13px] font-semibold border-[1.5px] transition-colors",
                selected
                  ? "bg-rm-ink text-white border-rm-ink"
                  : "bg-rm-paper text-rm-ink border-rm-line hover:border-rm-ink-3"
              )}
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}
