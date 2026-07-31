import { OrderStatus } from "@medusajs/framework/utils";

/**
 * Aggregates units sold per product across all non-canceled, non-draft
 * orders. Only used by the recompute job/workflow — future features must
 * read the persisted table via `getProductSalesRanking`, not re-aggregate
 * from orders on every request.
 *
 * `order_line_item.product_id` is a denormalized, nullable text column with
 * no formal link to `product` — items whose product was deleted are skipped.
 */
export async function computeUnitsSoldByProduct(
  query: { graph: (...args: any[]) => Promise<{ data: any[] }> }
): Promise<Map<string, number>> {
  const unitsSoldByProduct = new Map<string, number>();

  const take = 200;
  let skip = 0;

  while (true) {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["items.product_id", "items.quantity"],
      filters: {
        status: { $ne: OrderStatus.CANCELED },
        is_draft_order: false,
      },
      pagination: { skip, take, order: { id: "ASC" } },
    });

    for (const order of orders as any[]) {
      for (const item of order.items ?? []) {
        if (!item.product_id) {
          continue;
        }
        const current = unitsSoldByProduct.get(item.product_id) ?? 0;
        unitsSoldByProduct.set(item.product_id, current + item.quantity);
      }
    }

    if (orders.length < take) {
      break;
    }
    skip += take;
  }

  return unitsSoldByProduct;
}
