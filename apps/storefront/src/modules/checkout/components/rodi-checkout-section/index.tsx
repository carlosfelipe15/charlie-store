"use client"

import { RodiIconCheck } from "@modules/common/icons/rodi"
import { clsx } from "clsx"
import { ReactNode } from "react"

type RodiCheckoutSectionProps = {
  title: string
  subtitle?: string
  done?: boolean
  active?: boolean
  onEdit?: () => void
  children?: ReactNode
  className?: string
}

export default function RodiCheckoutSection({
  title,
  subtitle,
  done,
  active,
  onEdit,
  children,
  className,
}: RodiCheckoutSectionProps) {
  return (
    <section
      className={clsx(
        "bg-rm-paper rounded-rm-lg p-4 small:p-5 mb-3 border-[1.5px]",
        active ? "border-rm-ink" : "border-rm-line",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {done && (
            <span className="w-[22px] h-[22px] rounded-full bg-rm-green text-white grid place-items-center shrink-0 mt-0.5">
              <RodiIconCheck size={12} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold tracking-tight text-rm-ink m-0">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[13px] text-rm-ink-2 mt-1 m-0">{subtitle}</p>
            )}
          </div>
        </div>
        {done && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[13px] font-bold text-rm-red hover:underline shrink-0"
          >
            Editar
          </button>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  )
}
