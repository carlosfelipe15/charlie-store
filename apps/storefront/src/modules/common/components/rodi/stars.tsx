import { clsx } from "clsx"

import { RodiIconStar } from "@modules/common/icons/rodi"

export type RodiStarsProps = {
  value?: number
  size?: number
  className?: string
}

export function RodiStars({ value = 4.5, size = 13, className }: RodiStarsProps) {
  const filled = Math.round(value)
  return (
    <span
      className={clsx("inline-flex gap-px text-rm-yellow-deep", className)}
      aria-label={`${value} de 5 estrellas`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={clsx(i < filled ? "opacity-100" : "opacity-30")}>
          <RodiIconStar size={size} filled />
        </span>
      ))}
    </span>
  )
}
