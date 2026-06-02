import { clsx } from "clsx"

export type RodiBtnKind =
  | "primary"
  | "dark"
  | "yellow"
  | "ghost"
  | "outline"
  | "soft"

export type RodiBtnSize = "sm" | "md" | "lg"

const kindClasses: Record<RodiBtnKind, string> = {
  primary: "bg-rm-red text-white border-transparent hover:bg-rm-red-deep",
  dark: "bg-rm-ink text-white border-transparent hover:opacity-90",
  yellow: "bg-rm-yellow text-rm-ink border-transparent hover:bg-rm-yellow-deep",
  ghost:
    "bg-transparent text-rm-ink border border-rm-line hover:bg-rm-line-2",
  outline:
    "bg-rm-paper text-rm-ink border-[1.5px] border-rm-ink hover:bg-rm-line-2",
  soft: "bg-rm-line-2 text-rm-ink border-transparent hover:bg-rm-line",
}

const sizeClasses: Record<RodiBtnSize, string> = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-[42px] px-[18px] text-sm",
  lg: "h-[52px] px-6 text-[15px]",
}

export function rodiBtnClassName({
  kind = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  kind?: RodiBtnKind
  size?: RodiBtnSize
  fullWidth?: boolean
  className?: string
}) {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-rm-md font-bold font-sans transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rm-red",
    "disabled:opacity-50 disabled:pointer-events-none",
    kindClasses[kind],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  )
}
