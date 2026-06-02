/**
 * Rodi Mercado design tokens (from design-reference/ecommerce-test/tokens.jsx).
 * Use CSS variables (--rm-*) in styles; use this object in TS when needed.
 */
export const rodiColors = {
  red: "#E63946",
  redDeep: "#C82333",
  redInk: "#7A1B22",
  yellow: "#FFC233",
  yellowDeep: "#E5A800",
  green: "#0F7A3E",
  greenSoft: "#E6F4EC",
  blue: "#1E5BD8",
  ink: "#1A1714",
  ink2: "#3D3733",
  ink3: "#6B655F",
  ink4: "#9A938C",
  line: "#E8E3DC",
  line2: "#F2EDE6",
  cream: "#FAF7F1",
  paper: "#FFFFFF",
  sPink: "#FFE3E1",
  sPeach: "#FFD8B8",
  sButter: "#FFEFC2",
  sMint: "#D8F1DD",
  sSky: "#D9EAFF",
  sLilac: "#E6DAFF",
  sSand: "#EFE6D2",
} as const

export const rodiRadii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const

/** Keys map to --rm-* CSS variables in globals.css */
export const rodiColorSwatches: { name: string; cssVar: string; hex: string }[] =
  [
    { name: "red", cssVar: "--rm-red", hex: rodiColors.red },
    { name: "redDeep", cssVar: "--rm-red-deep", hex: rodiColors.redDeep },
    { name: "yellow", cssVar: "--rm-yellow", hex: rodiColors.yellow },
    { name: "green", cssVar: "--rm-green", hex: rodiColors.green },
    { name: "blue", cssVar: "--rm-blue", hex: rodiColors.blue },
    { name: "ink", cssVar: "--rm-ink", hex: rodiColors.ink },
    { name: "ink2", cssVar: "--rm-ink-2", hex: rodiColors.ink2 },
    { name: "ink3", cssVar: "--rm-ink-3", hex: rodiColors.ink3 },
    { name: "line", cssVar: "--rm-line", hex: rodiColors.line },
    { name: "cream", cssVar: "--rm-cream", hex: rodiColors.cream },
    { name: "paper", cssVar: "--rm-paper", hex: rodiColors.paper },
    { name: "sMint", cssVar: "--rm-s-mint", hex: rodiColors.sMint },
    { name: "sButter", cssVar: "--rm-s-butter", hex: rodiColors.sButter },
    { name: "sPink", cssVar: "--rm-s-pink", hex: rodiColors.sPink },
    { name: "sPeach", cssVar: "--rm-s-peach", hex: rodiColors.sPeach },
    { name: "sSky", cssVar: "--rm-s-sky", hex: rodiColors.sSky },
  ]

export const rodiTokens = {
  colors: rodiColors,
  radii: rodiRadii,
} as const
