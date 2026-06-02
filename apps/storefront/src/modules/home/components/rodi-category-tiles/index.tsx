import { listCategories } from "@lib/data/categories"
import { getCategoryEmoji } from "@lib/util/category-emoji"
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
      <div className="grid grid-cols-3 small:grid-cols-5 lg:grid-cols-7 gap-3 mt-4">
        {topLevel.slice(0, 14).map((cat) => (
          <LocalizedClientLink
            key={cat.id}
            href={`/categories/${cat.handle}`}
            className="flex flex-col items-center gap-2 p-3 bg-rm-paper border border-rm-line rounded-rm-lg hover:border-rm-ink hover:shadow-sm transition-all text-center"
          >
            <span className="text-3xl" aria-hidden>
              {getCategoryEmoji(cat.name)}
            </span>
            <span className="text-xs font-bold text-rm-ink leading-tight line-clamp-2">
              {cat.name}
            </span>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
