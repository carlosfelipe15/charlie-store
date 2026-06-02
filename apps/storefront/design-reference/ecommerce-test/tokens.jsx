// tokens.jsx — Rodi Mercado design tokens
// Brand: vibrant LATAM supermarket. Red primary, sale yellow, fresh green.

const RM = {
  // ── brand
  red: '#E63946',
  redDeep: '#C82333',
  redInk: '#7A1B22',
  yellow: '#FFC233',
  yellowDeep: '#E5A800',
  green: '#0F7A3E',
  greenSoft: '#E6F4EC',
  blue: '#1E5BD8',
  // ── neutrals (warm)
  ink: '#1A1714',
  ink2: '#3D3733',
  ink3: '#6B655F',
  ink4: '#9A938C',
  line: '#E8E3DC',
  line2: '#F2EDE6',
  cream: '#FAF7F1',
  paper: '#FFFFFF',
  // ── surfaces (vibrant category blocks)
  s_pink: '#FFE3E1',
  s_peach: '#FFD8B8',
  s_butter: '#FFEFC2',
  s_mint: '#D8F1DD',
  s_sky: '#D9EAFF',
  s_lilac: '#E6DAFF',
  s_sand: '#EFE6D2',
  // ── type
  fontDisplay: '"Bricolage Grotesque", system-ui, sans-serif',
  fontBody: '"Manrope", system-ui, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',
  // ── radii
  r_sm: 6, r_md: 10, r_lg: 14, r_xl: 20, r_pill: 999,
};

// COP formatter (Medusa stores amounts in minor units; this fakes the display)
function cop(n) {
  return '$' + n.toLocaleString('es-CO');
}
function mxn(n) {
  return '$' + n.toLocaleString('es-MX');
}

// Inline SVG icons (stroke 1.75, currentColor)
const Icon = {
  search: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
  ),
  cart: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.5 12h11L21 8H6.5"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
  ),
  user: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
  ),
  heart: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/></svg>
  ),
  pin: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>
  ),
  truck: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>
  ),
  chev: (s = 16, dir = 'down') => {
    const r = { down: 0, up: 180, left: 90, right: -90 }[dir];
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:`rotate(${r}deg)`}}><path d="m6 9 6 6 6-6"/></svg>
    );
  },
  menu: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
  ),
  plus: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
  ),
  minus: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/></svg>
  ),
  check: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4 10-10"/></svg>
  ),
  x: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
  ),
  star: (s = 14, filled = true) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?'currentColor':'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.4 20.3l1.1-6.3L2.9 9.6l6.3-.9Z"/></svg>
  ),
  shield: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6Z"/></svg>
  ),
  bolt: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6Z"/></svg>
  ),
  leaf: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4s-2 14-11 16C5 21 3 16 4 12 5 7 11 4 20 4Z"/><path d="M4 20 14 10"/></svg>
  ),
  back: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
  ),
  filter: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
  ),
  sort: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"/></svg>
  ),
  bag: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14l-1 13H6Z"/><path d="M9 7a3 3 0 1 1 6 0"/></svg>
  ),
};

Object.assign(window, { RM, cop, mxn, Icon });
