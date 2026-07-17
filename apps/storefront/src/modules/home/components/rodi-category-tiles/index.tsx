import { listCategories } from "@lib/data/categories"
import { getCategoryVisual } from "@lib/util/category-emoji"
import { RodiSectionHead } from "@modules/common/components/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

export default async function RodiCategoryTiles() {
  // No explicit `limit`: this endpoint returns categories and subcategories
  // mixed together, so a low limit risks truncating the raw page before the
  // top-level filter below runs (a subcategory in that window pushes a
  // top-level category out) — fetch everything (default limit), filter, then
  // slice to the display count.
  const categories = await listCategories()
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
        {topLevel.slice(0, 15).map((cat) => {
          const { emoji, token, desc, image } = getCategoryVisual(
            cat.handle,
            cat.name
          )
          return (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className={`group relative flex h-[132px] flex-col justify-end overflow-hidden rounded-rm-lg p-3.5 transition-transform hover:-translate-y-0.5 ${token}`}
            >
              {image ? (
                <>
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                    aria-hidden
                  />
                </>
              ) : (
                <span
                  className="pointer-events-none absolute -right-1 -bottom-2 text-6xl opacity-90"
                  aria-hidden
                >
                  {emoji}
                </span>
              )}
              {desc && (
                <span
                  className={`relative text-[11px] font-bold ${image ? "text-white/80" : "text-rm-ink-3"}`}
                >
                  {desc}
                </span>
              )}
              <span
                className={`font-display relative max-w-[80%] text-[15px] font-extrabold leading-tight tracking-tight ${image ? "text-white" : "text-rm-ink"}`}
              >
                {cat.name}
              </span>
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}
