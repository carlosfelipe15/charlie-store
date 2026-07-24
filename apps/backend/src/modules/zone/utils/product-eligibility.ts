/**
 * Shared "is this product available in this delivery zone" resolution.
 * Permissive fallback: a product with NO municipality links is available in
 * every zone; a product WITH links is available only in the zones it's
 * linked to. Resolved with a plain `query.graph()` expansion (product →
 * municipalities) + JS filter — no Index Engine, no reindex.
 *
 * Used by `/store/products-list`'s `zone_id` filter (unscoped — checks the
 * whole catalog) and by `/store/zones/eligibility-check` (scoped to a
 * cart's line items — cheap, no full-catalog scan).
 */
export async function getZoneEligibleProductIds(
  query: { graph: (...args: any[]) => Promise<{ data: any[] }> },
  zoneId: string,
  productIds?: string[]
): Promise<Set<string>> {
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "municipalities.id"],
    filters: productIds ? { id: productIds } : undefined,
    pagination: { take: 1000, skip: 0 },
  });

  const eligible = new Set<string>();
  for (const product of products as any[]) {
    const municipalities = product.municipalities ?? [];
    if (
      municipalities.length === 0 ||
      municipalities.some((m: any) => m.id === zoneId)
    ) {
      eligible.add(product.id);
    }
  }
  return eligible;
}
