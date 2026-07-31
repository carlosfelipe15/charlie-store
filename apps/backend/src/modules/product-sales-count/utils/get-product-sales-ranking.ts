/**
 * Reusable "how many units of each product have been sold" resolution,
 * backed by the persisted `product_sales_count` table (kept fresh by the
 * daily recompute job — see `workflows/upsert-product-sales-counts.ts`).
 * Any future feature (home section, admin widget, PDP badge) reads through
 * this same helper instead of re-aggregating from orders.
 */
export async function getProductSalesRanking(
  scope: { resolve: (key: string) => any },
  { productIds }: { productIds?: string[] } = {}
): Promise<Map<string, number>> {
  const productSalesCountModule = scope.resolve("productSalesCount");

  const rows = await productSalesCountModule.listProductSalesCounts(
    productIds ? { product_id: productIds } : {}
  );

  const ranking = new Map<string, number>();
  for (const row of rows as any[]) {
    ranking.set(row.product_id, row.units_sold);
  }
  return ranking;
}

/**
 * Pure ranking function — no container/DB access, safe to unit test in
 * isolation. Orders `ids` descending by units sold; products with no entry
 * in `salesRanking` count as 0 and sort to the end. Ties break by id (stable,
 * deterministic pagination) rather than by insertion order.
 */
export function rankProductIds(
  ids: string[],
  salesRanking: Map<string, number>
): string[] {
  return [...ids].sort((a, b) => {
    const unitsA = salesRanking.get(a) ?? 0;
    const unitsB = salesRanking.get(b) ?? 0;
    if (unitsA !== unitsB) {
      return unitsB - unitsA;
    }
    return a < b ? -1 : a > b ? 1 : 0;
  });
}
