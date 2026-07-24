/**
 * Canonical geographic order of Cuban provinces, west → east (Pinar del Río …
 * Guantánamo), with the special municipality "Isla de la Juventud" last. Used
 * to order the "Entregar en" picker the way the country reads on a map
 * instead of alphabetically. Codes match `scripts/seed-zones.ts`.
 *
 * Shared by `/store/zones` and `/admin/zones` (same shape, different auth —
 * see AGENTS.md on why store/admin routes for the same data stay separate
 * files rather than one crossing the auth boundary).
 */
export const PROVINCE_ORDER = [
  "PRI", "ART", "LHA", "MAY", "MTZ", "CFG", "VCL", "SSP",
  "CAV", "CMG", "LTU", "HOL", "GRM", "SCU", "GTM", "IJV",
];

export const provinceRank = (code: string): number => {
  const i = PROVINCE_ORDER.indexOf(code);
  return i === -1 ? PROVINCE_ORDER.length : i;
};

/**
 * `Province.code` → ISO 3166-2:CU subdivision code. Single source of truth
 * for `Province.iso_code`, seeded/backfilled by `scripts/seed-zones.ts`.
 * Previously lived only inside the now-historical
 * `scripts/migrate-fulfillment-to-provinces.ts`, keyed by province *name*
 * (fragile — depends on exact diacritics matching) instead of `code`
 * (stable, ASCII, already the join key used everywhere else in this module).
 */
export const CUBA_PROVINCE_ISO_CODE: Record<string, string> = {
  PRI: "cu-01",
  ART: "cu-15",
  LHA: "cu-03",
  MAY: "cu-16",
  MTZ: "cu-04",
  CFG: "cu-06",
  VCL: "cu-05",
  SSP: "cu-07",
  CAV: "cu-08",
  CMG: "cu-09",
  LTU: "cu-10",
  HOL: "cu-11",
  GRM: "cu-12",
  SCU: "cu-13",
  GTM: "cu-14",
  IJV: "cu-99",
};
