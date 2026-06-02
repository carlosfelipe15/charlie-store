import { clsx } from "clsx"
import { ReactNode } from "react"

export type RodiHeaderActionProps = {
  icon: ReactNode
  label: string
  sub: ReactNode
  badge?: string | number
  highlight?: boolean
  className?: string
}

export function RodiHeaderAction({
  icon,
  label,
  sub,
  badge,
  highlight,
  className,
}: RodiHeaderActionProps) {
  return (
    <div
      className={clsx(
        "relative flex items-center gap-2.5 px-3 py-2 rounded-rm-md",
        highlight ? "bg-rm-line-2" : "bg-transparent",
        className
      )}
    >
      <div
        className={clsx(
          "relative shrink-0",
          highlight ? "text-rm-red" : "text-rm-ink"
        )}
      >
        {icon}
        {badge !== undefined && badge !== null && Number(badge) > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rm-red text-white text-[10px] font-extrabold grid place-items-center leading-none">
            {badge}
          </span>
        )}
      </div>
      <div className="hidden small:block leading-tight text-left">
        <div className="text-[10px] text-rm-ink-3 uppercase tracking-widest font-bold">
          {label}
        </div>
        <div className="text-[13px] font-bold text-rm-ink">{sub}</div>
      </div>
    </div>
  )
}
