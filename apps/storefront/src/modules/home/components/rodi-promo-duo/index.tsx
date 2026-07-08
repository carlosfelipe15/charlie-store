import { RodiBtnLink } from "@modules/common/components/rodi"
import { clsx } from "clsx"

type PromoBannerProps = {
  kicker: string
  title: string
  body: string
  emoji: string
  href: string
  cta: string
  variant: "light" | "dark"
}

function PromoBanner({
  kicker,
  title,
  body,
  emoji,
  href,
  cta,
  variant,
}: PromoBannerProps) {
  const isDark = variant === "dark"

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-rm-xl p-7 flex flex-col justify-between min-h-[220px]",
        isDark ? "bg-rm-ink text-white" : "bg-rm-s-peach text-rm-ink"
      )}
    >
      <div>
        <p
          className={clsx(
            "text-xs font-extrabold uppercase tracking-widest",
            isDark ? "text-rm-yellow" : "text-rm-red"
          )}
        >
          {kicker}
        </p>
        <p className="font-display text-2xl font-extrabold tracking-tight leading-tight mt-2 max-w-[380px]">
          {title}
        </p>
        <p
          className={clsx(
            "text-sm mt-2.5 max-w-[380px] leading-relaxed",
            isDark ? "text-white/80" : "text-rm-ink-2"
          )}
        >
          {body}
        </p>
      </div>
      <RodiBtnLink
        href={href}
        kind={isDark ? "yellow" : "dark"}
        size="md"
        className="w-fit mt-4"
      >
        {cta} →
      </RodiBtnLink>
      <span
        className="absolute -right-5 -bottom-7 text-[180px] leading-none pointer-events-none opacity-20"
        aria-hidden
      >
        {emoji}
      </span>
    </div>
  )
}

/**
 * Promo banner duo (design-reference/ecommerce-test/home.jsx:147-162,
 * "Recetas de la semana" + "Suscripción Rodi+"). Static — same criterion as
 * the hero side cards, which are hardcoded copy today.
 */
export default function RodiPromoDuo() {
  return (
    <section className="content-container py-8">
      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <PromoBanner
          kicker="Recetas de la semana"
          title="Domingo de pasta · 4 personas por $24.900"
          body="Te armamos la lista. Agregamos los 6 ingredientes a tu carrito en un clic."
          emoji="🍝"
          href="/store"
          cta="Ver receta"
          variant="light"
        />
        <PromoBanner
          kicker="Suscripción Rodi+"
          title="Envíos gratis ilimitados por $9.900/mes"
          body="Pedidos sin mínimo, productos exclusivos y devoluciones express."
          emoji="✦"
          href="/store"
          cta="Probar gratis"
          variant="dark"
        />
      </div>
    </section>
  )
}
