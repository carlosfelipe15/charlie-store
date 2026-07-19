"use client"

import { clsx } from "clsx"

import { RodiIconCheck } from "@modules/common/icons/rodi"

type RodiFilterRowProps = {
  id: string
  checked: boolean
  onChange: () => void
  count?: number
  children: React.ReactNode
  "data-testid"?: string
}

/**
 * Checkbox filter row — matches design-reference `FilterRow` (pages.jsx):
 * custom 16x16 checkbox, label content, muted "(N)" count. `children` is the
 * label content so this can render plain text (Marca/Atributos/Promociones)
 * or stars + "y más" (Calificación) through the same row shell.
 */
export default function RodiFilterRow({
  id,
  checked,
  onChange,
  count,
  children,
  "data-testid": dataTestId,
}: RodiFilterRowProps) {
  return (
    <li>
      <label
        htmlFor={id}
        className="flex items-center gap-2 py-1 text-sm cursor-pointer"
      >
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
          data-testid={dataTestId}
        />
        <span
          className={clsx(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
            checked
              ? "bg-rm-ink border-rm-ink text-white"
              : "bg-rm-paper border-rm-line"
          )}
          aria-hidden
        >
          {checked && <RodiIconCheck size={11} />}
        </span>
        <span className="flex flex-1 items-center gap-1.5 min-w-0 font-medium text-rm-ink">
          {children}
        </span>
        {typeof count === "number" && (
          <span className="text-xs text-rm-ink-4 shrink-0">({count})</span>
        )}
      </label>
    </li>
  )
}
