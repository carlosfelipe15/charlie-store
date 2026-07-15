import { HttpTypes } from "@medusajs/types";
import { CURATED_CATEGORY_HANDLES } from "./category-emoji";

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}

// Appliances keep the large "hero" gallery like apparel — the design
// reference itself uses an air fryer as the example product for
// pdp.jsx's PDPv1/v2 (large image), while PDPv3 ("Grocery-density",
// compact) uses an avocado. Purchase consideration for appliances hinges
// on inspecting finish/size, same as apparel — not a quick commodity
// repurchase like groceries.
const HERO_CATEGORY_HANDLES = new Set(["electrodomesticos"]);

const SIZE_OR_COLOR_OPTION_TITLE = /talla|size|color/i;

/**
 * Compact product image treatment (small, contained packshot) instead of
 * the large hero gallery, for everyday grocery items where the photo
 * doesn't carry purchase-decision weight (fit, texture, finish) the way it
 * does for apparel or appliances. Matches
 * design-reference/ecommerce-test/pdp.jsx's PDPv3 ("Grocery-density").
 */
export const shouldUseCompactGallery = (product: HttpTypes.StoreProduct): boolean => {
    const hasSizeOrColorOptions = (product.options ?? []).some((option) =>
        SIZE_OR_COLOR_OPTION_TITLE.test(option.title ?? "")
    );
    if (hasSizeOrColorOptions) {
        return false;
    }

    const categoryHandles = (product.categories ?? [])
        .map((category) => category.handle)
        .filter((handle): handle is string => !!handle);

    return categoryHandles.some(
        (handle) =>
            CURATED_CATEGORY_HANDLES.includes(handle) &&
            !HERO_CATEGORY_HANDLES.has(handle)
    );
}