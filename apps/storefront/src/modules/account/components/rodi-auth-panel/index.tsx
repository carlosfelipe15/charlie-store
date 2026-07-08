import { ReviewSummary } from "@lib/data/reviews"
import { RodiLogo, RodiPill } from "@modules/common/components/rodi"
import { RodiIconBolt } from "@modules/common/icons/rodi"

function formatReviewStat(summary?: ReviewSummary): [string, string] | null {
  if (!summary || summary.count === 0) {
    return null
  }
  const compactCount =
    summary.count >= 1000
      ? `${Math.round(summary.count / 100) / 10}k`
      : String(summary.count)
  return [compactCount, `reseñas ${Math.round(summary.average)}★`]
}

export default function RodiAuthPanel({
  reviewSummary,
}: {
  reviewSummary?: ReviewSummary
}) {
  const reviewStat = formatReviewStat(reviewSummary)
  const stats: [string, string][] = [
    ...(reviewStat ? [reviewStat] : []),
    ["90 min", "entrega"],
    ["$80k", "envío gratis"],
  ]

  return (
    <aside className="hidden lg:flex flex-col justify-between bg-rm-red text-white p-12 xl:p-14 relative overflow-hidden min-h-[520px]">
      <RodiLogo
        size={22}
        markClassName="bg-white text-rm-red"
        textClassName="text-white"
      />
      <div className="relative z-10 max-w-md">
        <RodiPill
          bgClassName="bg-white/20"
          textClassName="text-white"
          className="mb-4 normal-case tracking-normal"
        >
          <RodiIconBolt size={12} />
          Para tu próxima compra
        </RodiPill>
        <h1 className="font-display text-5xl xl:text-6xl font-extrabold tracking-tight leading-[0.95] m-0">
          Tu mercado
          <br />
          en 90 minutos.
        </h1>
        <p className="text-base opacity-90 leading-relaxed mt-4 max-w-sm">
          Frescos del día, marcas que amas y entrega rápida. Crea tu cuenta y
          desbloquea descuentos exclusivos.
        </p>
        <div className="flex gap-8 mt-8">
          {stats.map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-2xl font-extrabold tracking-tight">
                {n}
              </div>
              <div className="text-[11px] opacity-75 uppercase tracking-wider mt-0.5">
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
      <span
        className="pointer-events-none absolute right-[-40px] top-28 text-[200px] opacity-20"
        aria-hidden
      >
        🛒
      </span>
    </aside>
  )
}
