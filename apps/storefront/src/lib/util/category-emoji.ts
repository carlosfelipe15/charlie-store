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
