import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import ZoneModule from "../modules/zone";

/**
 * Many-to-many: a product is available in many municipalities; a municipality
 * carries many products. This is the first N–M link in this repo (brand is
 * many-products→one-brand; review/favorite are one-product→many). `isList: true`
 * on BOTH sides is what makes it many-to-many.
 *
 * Deliberately NOT `filterable`: the zone filter on `/store/products-list`
 * resolves "products available in municipality X" with a plain `query.graph()`
 * expansion (product → municipalities) + a JS permissive-fallback filter, the
 * same shape as the existing `rating_gte`/`on_sale` filters. That avoids the
 * Index Engine entirely, so there is NO reindex step tied to zone data (unlike
 * `brand_id`). See the route and the feature plan for the rationale.
 */
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  {
    linkable: ZoneModule.linkable.municipality,
    isList: true,
  }
);
