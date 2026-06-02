"use client"

import { RodiIconCheck } from "@modules/common/icons/rodi"
import { clsx } from "clsx"
import { useSearchParams } from "next/navigation"

const STEPS = [
  { id: "address", label: "Dirección" },
  { id: "delivery", label: "Envío" },
  { id: "payment", label: "Pago" },
  { id: "review", label: "Confirmación" },
] as const

export default function RodiCheckoutStepper() {
  const searchParams = useSearchParams()
  const current = searchParams.get("step") || "address"
  const currentIndex = STEPS.findIndex((s) => s.id === current)

  return (
    <div className="bg-rm-paper border-b border-rm-line">
      <div className="content-container py-3.5">
        <ol className="flex items-center justify-center gap-2 small:gap-8 flex-wrap">
          {STEPS.map((step, i) => {
            const done = i < currentIndex
            const active = step.id === current
            return (
              <li key={step.id} className="flex items-center gap-2 small:gap-8">
                <div className="flex items-center gap-2.5">
                  <span
                    className={clsx(
                      "w-7 h-7 rounded-full text-xs font-extrabold grid place-items-center shrink-0",
                      done && "bg-rm-green text-white",
                      active && !done && "bg-rm-red text-white",
                      !done && !active && "bg-rm-paper text-rm-ink-3 border-[1.5px] border-rm-line"
                    )}
                  >
                    {done ? <RodiIconCheck size={14} /> : i + 1}
                  </span>
                  <span
                    className={clsx(
                      "text-[13px] font-semibold hidden small:inline",
                      active ? "text-rm-ink font-extrabold" : done ? "text-rm-ink-2" : "text-rm-ink-3"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    className={clsx(
                      "w-8 small:w-[60px] h-0.5 rounded-full hidden small:block",
                      done ? "bg-rm-green" : "bg-rm-line"
                    )}
                    aria-hidden
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
