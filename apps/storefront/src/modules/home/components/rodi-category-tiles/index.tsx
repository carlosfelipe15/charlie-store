import { listCategories } from "@lib/data/categories"
import { getCategoryVisual } from "@lib/util/category-emoji"
import { RodiSectionHead } from "@modules/common/components/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function RodiCategoryTiles() {
  const categories = await listCategories({ limit: 14 })
  const topLevel = (categories ?? []).filter((c) => !c.parent_category)

  if (!topLevel.length) return null

  return (
    <section className="content-container py-8">
      <RodiSectionHead
        title="Compra por categoría"
        actionLabel="Ver todas"
        actionHref="/store"
      />
      <div className="grid grid-cols-3 small:grid-cols-5 large:grid-cols-7 gap-3 mt-4">
        {topLevel.slice(0, 14).map((cat) => {
          const { emoji, token, desc } = getCategoryVisual(
            cat.handle,
            cat.name
          )
          return (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className={`relative flex h-[132px] flex-col justify-between overflow-hidden rounded-rm-lg p-3.5 transition-transform hover:-translate-y-0.5 ${token}`}
            >
              <span
                className="pointer-events-none absolute -right-1 -bottom-2 text-6xl opacity-90"
                aria-hidden
              >
                {emoji}
              </span>
              {desc && (
                <span className="text-[11px] font-bold text-rm-ink-3">
                  {desc}
                </span>
              )}
              <span className="font-display max-w-[70%] text-[15px] font-extrabold leading-tight tracking-tight text-rm-ink">
                {cat.name}
              </span>
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}
