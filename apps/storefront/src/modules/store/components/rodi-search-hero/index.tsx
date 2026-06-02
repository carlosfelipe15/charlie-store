type RodiSearchHeroProps = {
  query: string
  resultCount?: number
}

export default function RodiSearchHero({
  query,
  resultCount,
}: RodiSearchHeroProps) {
  return (
    <section className="mb-6" data-testid="search-results-header">
      {resultCount != null && (
        <p className="text-xs font-semibold text-rm-ink-3 mb-1.5">
          {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
        </p>
      )}
      <h1
        className="font-display text-3xl small:text-4xl font-extrabold tracking-tight text-rm-ink leading-tight m-0"
        data-testid="store-page-title"
      >
        Resultados para{" "}
        <span className="text-rm-red">&ldquo;{query}&rdquo;</span>
      </h1>
    </section>
  )
}
