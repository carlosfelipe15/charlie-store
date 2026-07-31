import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
    createPriceListsWorkflow,
    createPromotionsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Idempotent seed of base demo promotions/offers, for demonstrations:
 *
 * 1. A "sale" Price List ("Ofertas relámpago") with a 25% discount on a
 *    deterministic subset of the catalog (first 6 products alphabetically
 *    by handle that have both eur/usd prices) — this is what
 *    `rodi-flash-sale`/`rodi-curated-row` (home) and the `on_sale` PLP
 *    filter (Fase 11) need to render non-empty; see
 *    `docs/development.md` § "Datos de prueba: Price List de oferta".
 * 2. Two coupon-code Promotions ("BIENVENIDA10" 10% off items,
 *    "ENVIOGRATIS" 100% off shipping) — the cart discount-code UI
 *    (`rodi-cart-discount`) already calls `applyPromotions`, but there was
 *    no promotion to actually redeem.
 *
 * Safe to re-run: looks up the price list by title and promotions by code
 * before creating, skips whatever already exists.
 */

const SALE_PRICE_LIST_TITLE = "Ofertas relámpago";
const SALE_DISCOUNT_RATIO = 0.75; // 25% off
const SALE_PRODUCT_COUNT = 6;

const PROMOTION_CODES = ["BIENVENIDA10", "ENVIOGRATIS"] as const;

export default async function seedPromotions({ container }: { container: MedusaContainer }) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    await seedSalePriceList({ container, query, logger });
    await seedCouponPromotions({ container, query, logger });
}

async function seedSalePriceList({ container, query, logger }: SeedCtx) {
    const { data: existingPriceLists } = await query.graph({
        entity: "price_list",
        fields: ["id", "title"],
    });

    if ((existingPriceLists as any[]).some((pl) => pl.title === SALE_PRICE_LIST_TITLE)) {
        logger.info(`Price list "${SALE_PRICE_LIST_TITLE}" ya existe, no se crea de nuevo.`);
        return;
    }

    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "handle", "title", "variants.id", "variants.prices.amount", "variants.prices.currency_code"],
    });

    const eligible = (products as any[])
        .filter((p) => (p.variants ?? []).every((v: any) => (v.prices ?? []).length > 0))
        .sort((a, b) => a.handle.localeCompare(b.handle))
        .slice(0, SALE_PRODUCT_COUNT);

    if (eligible.length === 0) {
        logger.warn("No hay productos con precios para armar la price list de oferta. Saltando.");
        return;
    }

    const prices: any[] = [];
    for (const product of eligible) {
        for (const variant of product.variants as any[]) {
            for (const price of variant.prices as any[]) {
                prices.push({
                    variant_id: variant.id,
                    currency_code: price.currency_code,
                    amount: Math.round(price.amount * SALE_DISCOUNT_RATIO * 100) / 100,
                });
            }
        }
    }

    await createPriceListsWorkflow(container).run({
        input: {
            price_lists_data: [
                {
                    title: SALE_PRICE_LIST_TITLE,
                    description: "Descuento de demostración (25% off) sobre un subconjunto fijo del catálogo.",
                    status: "active",
                    type: "sale",
                    starts_at: null,
                    ends_at: null,
                    prices,
                } as any,
            ],
        },
    });

    logger.info(
        `Price list "${SALE_PRICE_LIST_TITLE}" creada con ${eligible.length} producto(s): ${eligible
            .map((p: any) => p.handle)
            .join(", ")}.`
    );
}

async function seedCouponPromotions({ container, query, logger }: SeedCtx) {
    const { data: existingPromotions } = await query.graph({
        entity: "promotion",
        fields: ["id", "code"],
    });
    const existingCodes = new Set((existingPromotions as any[]).map((p) => p.code));

    const promotionsData: any[] = [];

    if (!existingCodes.has("BIENVENIDA10")) {
        promotionsData.push({
            code: "BIENVENIDA10",
            type: "standard",
            status: "active",
            is_automatic: false,
            application_method: {
                type: "percentage",
                target_type: "items",
                allocation: "across",
                value: 10,
            },
        });
    }

    if (!existingCodes.has("ENVIOGRATIS")) {
        promotionsData.push({
            code: "ENVIOGRATIS",
            type: "standard",
            status: "active",
            is_automatic: false,
            application_method: {
                type: "percentage",
                target_type: "shipping_methods",
                allocation: "across",
                value: 100,
            },
        });
    }

    if (promotionsData.length === 0) {
        logger.info(`Los códigos de promoción (${PROMOTION_CODES.join(", ")}) ya existen, no se crean de nuevo.`);
        return;
    }

    await createPromotionsWorkflow(container).run({
        input: { promotionsData },
    });

    logger.info(`Promociones creadas: ${promotionsData.map((p) => p.code).join(", ")}.`);
}

type SeedCtx = {
    container: MedusaContainer;
    query: ReturnType<MedusaContainer["resolve"]>;
    logger: ReturnType<MedusaContainer["resolve"]>;
};
