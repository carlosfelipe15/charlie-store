import { clsx } from "clsx"
import { HTMLAttributes } from "react"

export type RodiPillProps = HTMLAttributes<HTMLSpanElement> & {
  bgClassName?: string
  textClassName?: string
}

export function RodiPill({
  children,
  className,
  bgClassName = "bg-rm-line-2",
  textClassName = "text-rm-ink",
  ...props
}: RodiPillProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-rm-pill text-[11px] font-bold uppercase tracking-wide",
        bgClassName,
        textClassName,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
