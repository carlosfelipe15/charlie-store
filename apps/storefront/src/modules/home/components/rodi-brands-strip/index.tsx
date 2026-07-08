import { listBrands } from "@lib/data/brands"
import { RodiSectionHead } from "@modules/common/components/rodi"

// Placeholder brand names from design-reference/ecommerce-test/home.jsx:178,
// used only until real brands are assigned via the `brand` module (Fase 4).
const FALLBACK_BRANDS = [
  "Alquería",
  "Doria",
  "Colanta",
  "Diana",
  "Bimbo",
  "Coca-Cola",
  "Margarita",
  "Familia",
  "Pantene",
  "Colgate",
  "Huggies",
  "Dog Chow",
  "Philips",
  "Oster",
  "Águila Roja",
  "Cristal",
]

/**
 * Brands strip (design-reference/ecommerce-test/home.jsx:175-187). Prefers
 * real brands from the `brand` module (Fase 4) once they exist; falls back to
 * the design's placeholder names otherwise.
 */
export default async function RodiBrandsStrip() {
  const brands = await listBrands()
  const names = brands.length
    ? brands.map((b) => b.name)
    : FALLBACK_BRANDS

  return (
    <section className="content-container py-8">
      <RodiSectionHead title="Marcas que amas" />
      <div className="grid grid-cols-4 small:grid-cols-8 gap-3">
        {names.slice(0, 16).map((name) => (
          <div
            key={name}
            className="h-20 grid place-items-center bg-rm-paper border border-rm-line rounded-rm-md font-display font-extrabold text-[15px] text-rm-ink-2 tracking-tight text-center px-2"
          >
            {name}
          </div>
        ))}
      </div>
    </section>
  )
}
