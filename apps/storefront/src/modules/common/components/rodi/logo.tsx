import { clsx } from "clsx"

export type RodiLogoProps = {
  size?: number
  className?: string
  /** Circle behind the "r" mark */
  markClassName?: string
  /** "Rodi.Mercado" text */
  textClassName?: string
}

export function RodiLogo({
  size = 22,
  className,
  markClassName = "bg-rm-red text-white",
  textClassName = "text-rm-ink",
}: RodiLogoProps) {
  const circle = size * 1.4
  return (
    <span
      className={clsx("inline-flex items-center font-display font-extrabold", className)}
      style={{ gap: size * 0.36, fontSize: size }}
    >
      <span
        className={clsx(
          "grid place-items-center rounded-full leading-none",
          markClassName
        )}
        style={{
          width: circle,
          height: circle,
          fontSize: size * 0.85,
        }}
        aria-hidden
      >
        r
      </span>
      <span className={clsx("tracking-tight", textClassName)}>
        Rodi<span className="text-rm-red">.</span>Mercado
      </span>
    </span>
  )
}
