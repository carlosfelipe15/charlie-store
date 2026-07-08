import { retrieveCustomer } from "@lib/data/customer"
import { getProductReviewSummary, listProductReviews } from "@lib/data/reviews"
import { RodiSectionHead, RodiStars } from "@modules/common/components/rodi"
import RodiReviewForm from "./review-form"

const STAR_ORDER = ["5", "4", "3", "2", "1"] as const

export default async function RodiProductReviews({
  productId,
}: {
  productId: string
}) {
  const [summary, reviews, customer] = await Promise.all([
    getProductReviewSummary(productId),
    listProductReviews(productId),
    retrieveCustomer().catch(() => null),
  ])

  return (
    <section className="content-container py-10" id="reviews">
      <RodiSectionHead title="Reseñas" />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        <div className="flex flex-col gap-5">
          {summary.count > 0 ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold text-rm-ink">
                  {summary.average}
                </span>
                <RodiStars value={summary.average} size={16} />
              </div>
              <p className="text-sm text-rm-ink-3 mt-1">
                {summary.count} {summary.count === 1 ? "reseña" : "reseñas"}
              </p>
              <div className="flex flex-col gap-1.5 mt-4">
                {STAR_ORDER.map((star) => {
                  const value = summary.distribution[star]
                  const pct =
                    summary.count > 0
                      ? Math.round((value / summary.count) * 100)
                      : 0
                  return (
                    <div
                      key={star}
                      className="flex items-center gap-2 text-xs text-rm-ink-3"
                    >
                      <span className="w-3 text-right">{star}★</span>
                      <div className="flex-1 h-1.5 bg-rm-line-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rm-yellow-deep"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right">{value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-rm-ink-2">
              Este producto todavía no tiene reseñas. ¡Sé el primero en
              opinar!
            </p>
          )}

          <div className="border-t border-rm-line pt-5">
            <RodiReviewForm productId={productId} isLoggedIn={!!customer} />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {reviews.length === 0 ? (
            <p className="text-sm text-rm-ink-3">
              Aún no hay comentarios para mostrar.
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-rm-line pb-5">
                <div className="flex items-center gap-2">
                  <RodiStars value={review.rating} size={13} />
                  {review.title && (
                    <span className="font-semibold text-sm text-rm-ink">
                      {review.title}
                    </span>
                  )}
                </div>
                <p className="text-sm text-rm-ink-2 mt-1.5 leading-relaxed">
                  {review.body}
                </p>
                <p className="text-xs text-rm-ink-4 mt-1.5">
                  {new Date(review.created_at).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
