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
 * `colors.rm`).
 */
const CATEGORY_VISUAL_BY_HANDLE: Record<
  string,
  { emoji: string; token: string; desc: string }
> = {
  frescos: { emoji: "🥬", token: "bg-rm-s-mint", desc: "Cosechado esta semana" },
  despensa: { emoji: "🍝", token: "bg-rm-s-butter", desc: "Pasta, granos, aceites" },
  "lacteos-huevos": { emoji: "🥛", token: "bg-rm-s-sky", desc: "Leche, quesos, yogurt" },
  carnes: { emoji: "🥩", token: "bg-rm-s-pink", desc: "Frescos del día" },
  panaderia: { emoji: "🥖", token: "bg-rm-s-peach", desc: "Hornado en casa" },
  bebidas: { emoji: "🥤", token: "bg-rm-s-sky", desc: "Refrescos, jugos, agua" },
  "snacks-dulces": { emoji: "🍫", token: "bg-rm-s-butter", desc: "Antojos para todos" },
  congelados: { emoji: "🧊", token: "bg-rm-s-sky", desc: "Listos en minutos" },
  "aseo-personal": { emoji: "🧴", token: "bg-rm-s-lilac", desc: "Cuidado e higiene" },
  limpieza: { emoji: "🧽", token: "bg-rm-s-mint", desc: "Hogar impecable" },
  mascotas: { emoji: "🐶", token: "bg-rm-s-peach", desc: "Para tu compañero" },
  bebe: { emoji: "🍼", token: "bg-rm-s-pink", desc: "Pañales, fórmula, papillas" },
  electrodomesticos: { emoji: "🔌", token: "bg-rm-s-sand", desc: "Para tu cocina y hogar" },
  farmacia: { emoji: "💊", token: "bg-rm-s-mint", desc: "Cuidado y bienestar" },
}

const DEFAULT_TOKEN = "bg-rm-line-2"

export type CategoryVisual = { emoji: string; token: string; desc?: string }

/**
 * Resolves emoji + surface color + tagline for a category tile. Looks up by
 * `handle` first (exact match against the Rodi Mercado design categories);
 * falls back to keyword matching on `name` for categories outside that set
 * (e.g. the demo apparel categories still used for QA), and finally to a
 * neutral token. `desc` is only defined for the curated 14 — callers should
 * treat it as optional.
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
