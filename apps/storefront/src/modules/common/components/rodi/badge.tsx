import { clsx } from "clsx"
import { HTMLAttributes } from "react"

export type RodiBadgeKind = "sale" | "new" | "fresco" | "org" | "bolt"

const kindConfig: Record<
  RodiBadgeKind,
  { label: string; className: string }
> = {
  sale: {
    label: "−25%",
    className: "bg-rm-red text-white border-transparent",
  },
  new: {
    label: "NUEVO",
    className: "bg-rm-ink text-white border-transparent",
  },
  fresco: {
    label: "FRESCO",
    className: "bg-rm-green text-white border-transparent",
  },
  org: {
    label: "ORGÁNICO",
    className: "bg-rm-paper text-rm-green border border-rm-green",
  },
  bolt: {
    label: "OFERTA",
    className: "bg-rm-yellow text-rm-ink border-transparent",
  },
}

export type RodiBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  kind?: RodiBadgeKind
}

export function RodiBadge({
  kind = "sale",
  children,
  className,
  ...props
}: RodiBadgeProps) {
  const config = kindConfig[kind]
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wide",
        config.className,
        className
      )}
      {...props}
    >
      {children ?? config.label}
    </span>
  )
}
