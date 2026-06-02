import { RodiIconChevron } from "@modules/common/icons/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type RodiBreadcrumbItem = {
  label: string
  href?: string
}

export default function RodiBreadcrumbs({ items }: { items: RodiBreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-[13px] text-rm-ink-3 py-3.5"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
          {i > 0 && <RodiIconChevron size={12} chevronDirection="right" />}
          {item.href ? (
            <LocalizedClientLink href={item.href} className="hover:text-rm-ink">
              {item.label}
            </LocalizedClientLink>
          ) : (
            <span className="font-semibold text-rm-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
