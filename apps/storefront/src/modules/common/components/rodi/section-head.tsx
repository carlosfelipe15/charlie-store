import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RodiIconChevron } from "@modules/common/icons/rodi"
import { clsx } from "clsx"

export type RodiSectionHeadProps = {
  kicker?: string
  title: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function RodiSectionHead({
  kicker,
  title,
  actionLabel = "Ver todo",
  actionHref,
  className,
}: RodiSectionHeadProps) {
  return (
    <div
      className={clsx(
        "flex items-end justify-between gap-4 mb-[18px]",
        className
      )}
    >
      <div>
        {kicker && (
          <p className="text-xs font-extrabold text-rm-red uppercase tracking-widest mb-1">
            {kicker}
          </p>
        )}
        <h2 className="font-display text-[28px] font-extrabold tracking-tight text-rm-ink leading-[1.05] m-0">
          {title}
        </h2>
      </div>
      {actionHref && actionLabel ? (
        <LocalizedClientLink
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-rm-ink hover:text-rm-red shrink-0"
        >
          {actionLabel}
          <RodiIconChevron size={12} chevronDirection="right" />
        </LocalizedClientLink>
      ) : null}
    </div>
  )
}
