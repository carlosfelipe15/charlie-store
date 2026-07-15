/** Decorative emoji for category rails (design-reference style). */
const EMOJI_BY_KEYWORD: [string, string][] = [
  ["fresco", "🥬"],
  ["fruta", "🥬"],
  ["verdura", "🥬"],
  ["despensa", "🍝"],
  ["lacteo", "🥛"],
  ["leche", "🥛"],
  ["huevo", "🥚"],
  ["carne", "🥩"],
  ["pescado", "🐟"],
  ["pan", "🥖"],
  ["bebida", "🥤"],
  ["snack", "🍫"],
  ["dulce", "🍫"],
  ["congel", "🧊"],
  ["aseo", "🧴"],
  ["limpieza", "🧽"],
  ["mascota", "🐶"],
  ["bebe", "🍼"],
  ["bebé", "🍼"],
  ["electro", "🔌"],
  ["farmacia", "💊"],
]

export function getCategoryEmoji(name?: string | null): string {
  if (!name) return "📦"
  const lower = name.toLowerCase()
  for (const [key, emoji] of EMOJI_BY_KEYWORD) {
    if (lower.includes(key)) return emoji
  }
  return "📦"
}

/**
 * Per-category emoji + surface color + short tagline, keyed by handle, ported
 * 1:1 from design-reference/ecommerce-test/data.jsx:13-27 (CATEGORIES).
 * Decorative only — intentionally static in the frontend rather than a
 * backend field, since these ~14 values don't need to be editable without a
 * deploy. `token` is a `bg-rm-s-*` Tailwind class (see tailwind.config.js
 * `colors.rm`). `image` points at a curated photo under `public/images/categories/`
 * (sourced from Unsplash, see CREDITS.md in that folder) — `emoji`/`token`
 * stay as the fallback for categories outside this curated set (e.g. demo
 * apparel) and as the loading-state background behind the photo.
 */
const CATEGORY_VISUAL_BY_HANDLE: Record<
  string,
  { emoji: string; token: string; desc: string; image: string }
> = {
  frescos: { emoji: "🥬", token: "bg-rm-s-mint", desc: "Cosechado esta semana", image: "/images/categories/frescos.jpg" },
  despensa: { emoji: "🍝", token: "bg-rm-s-butter", desc: "Pasta, granos, aceites", image: "/images/categories/despensa.jpg" },
  "lacteos-huevos": { emoji: "🥛", token: "bg-rm-s-sky", desc: "Leche, quesos, yogurt", image: "/images/categories/lacteos-huevos.jpg" },
  carnes: { emoji: "🥩", token: "bg-rm-s-pink", desc: "Frescos del día", image: "/images/categories/carnes.jpg" },
  panaderia: { emoji: "🥖", token: "bg-rm-s-peach", desc: "Horneado en casa", image: "/images/categories/panaderia.jpg" },
  bebidas: { emoji: "🥤", token: "bg-rm-s-sky", desc: "Refrescos, jugos, agua", image: "/images/categories/bebidas.jpg" },
  "snacks-dulces": { emoji: "🍫", token: "bg-rm-s-butter", desc: "Antojos para todos", image: "/images/categories/snacks-dulces.jpg" },
  congelados: { emoji: "🧊", token: "bg-rm-s-sky", desc: "Listos en minutos", image: "/images/categories/congelados.jpg" },
  "aseo-personal": { emoji: "🧴", token: "bg-rm-s-lilac", desc: "Cuidado e higiene", image: "/images/categories/aseo-personal.jpg" },
  limpieza: { emoji: "🧽", token: "bg-rm-s-mint", desc: "Hogar impecable", image: "/images/categories/limpieza.jpg" },
  mascotas: { emoji: "🐶", token: "bg-rm-s-peach", desc: "Para tu compañero", image: "/images/categories/mascotas.jpg" },
  bebe: { emoji: "🍼", token: "bg-rm-s-pink", desc: "Pañales, fórmula, papillas", image: "/images/categories/bebe.jpg" },
  electrodomesticos: { emoji: "🔌", token: "bg-rm-s-sand", desc: "Para tu cocina y hogar", image: "/images/categories/electrodomesticos.jpg" },
  farmacia: { emoji: "💊", token: "bg-rm-s-mint", desc: "Cuidado y bienestar", image: "/images/categories/farmacia.jpg" },
}

/** Handles of the curated Rodi Mercado categories (see CATEGORY_VISUAL_BY_HANDLE above). */
export const CURATED_CATEGORY_HANDLES = Object.keys(CATEGORY_VISUAL_BY_HANDLE)

const DEFAULT_TOKEN = "bg-rm-line-2"

export type CategoryVisual = {
  emoji: string
  token: string
  desc?: string
  image?: string
}

/**
 * Resolves emoji + surface color + tagline + photo for a category tile.
 * Looks up by `handle` first (exact match against the Rodi Mercado design
 * categories); falls back to keyword matching on `name` for categories
 * outside that set (e.g. the demo apparel categories still used for QA,
 * which have no curated photo), and finally to a neutral token. `desc`/`image`
 * are only defined for the curated 14 — callers should treat them as optional.
 */
export function getCategoryVisual(
  handle?: string | null,
  name?: string | null
): CategoryVisual {
  if (handle && CATEGORY_VISUAL_BY_HANDLE[handle]) {
    return CATEGORY_VISUAL_BY_HANDLE[handle]
  }
  return { emoji: getCategoryEmoji(name), token: DEFAULT_TOKEN }
}
