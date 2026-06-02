type RodiPlpHeroProps = {
  title: string
  subtitle?: string
  emoji?: string
}

export default function RodiPlpHero({
  title,
  subtitle,
  emoji = "🛒",
}: RodiPlpHeroProps) {
  return (
    <section className="bg-rm-s-butter px-6 py-7 flex items-center justify-between gap-4 rounded-rm-lg mb-6">
      <div>
        {subtitle && (
          <p className="text-xs font-semibold text-rm-ink-3 flex items-center gap-1.5 mb-1">
            <span>Inicio</span>
            <span>›</span>
            <span className="text-rm-ink font-bold">{title}</span>
          </p>
        )}
        <h1
          className="font-display text-4xl font-extrabold tracking-tight text-rm-ink leading-none m-0"
          data-testid="store-page-title"
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-rm-ink-2 mt-2">{subtitle}</p>
        )}
      </div>
      <span className="text-6xl md:text-7xl hidden sm:block" aria-hidden>
        {emoji}
      </span>
    </section>
  )
}
