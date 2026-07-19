import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createProductTagsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Idempotent seed for the "Atributos" PLP filter (product tags). The catalog
 * seeded by seed-mercado-catalog.ts has zero tags — dummyjson.com's product
 * descriptions never literally say "organic"/"gluten-free"/"sugar-free", so
 * keyword matching alone would leave 3 of the 4 tags empty. This script
 * tries keyword matching first (for genuineness, and to stay correct if the
 * source data ever changes) and falls back to a small deterministic handle
 * list per tag only when the keyword match finds nothing, so the Atributos
 * filter always has non-empty demo data.
 *
 * Safe to re-run: tags are looked up by `value` before creating, and the
 * `tag_ids` sent on update is always the union of a product's current tags
 * plus the newly assigned one (never a blind replace) — see
 * `apps/backend/src/api/store/products-list/route.ts` for why filtering by
 * tag doesn't need `@medusajs/index`: `product_tag` is a same-module
 * relation on `product`, unlike `brand`.
 */

const TAG_VALUES = ["Orgánico", "Sin gluten", "Sin azúcar", "Marca propia"] as const;
type TagValue = (typeof TAG_VALUES)[number];
type KeywordTagValue = Exclude<TagValue, "Marca propia">;

const KEYWORD_PATTERNS: Record<KeywordTagValue, RegExp> = {
    "Orgánico": /\borganic\b/i,
    "Sin gluten": /gluten[- ]?free/i,
    "Sin azúcar": /sugar[- ]?free|no[- ]?sugar/i,
};

// Used only if a keyword pattern above matches zero products — keeps the
// filter from shipping empty for tags the source data never mentions
// explicitly. Handles are drawn from GROCERIES in seed-mercado-catalog.ts.
const FALLBACK_HANDLES: Record<KeywordTagValue, string[]> = {
    "Orgánico": ["apple", "cucumber", "kiwi", "lemon"],
    "Sin gluten": ["milk", "eggs", "chicken-meat", "fish-steak"],
    "Sin azúcar": ["water", "cooking-oil", "rice", "protein-powder"],
};

export default async function seedProductAttributes({ container }: { container: MedusaContainer }) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data: existingTags } = await query.graph({
        entity: "product_tag",
        fields: ["id", "value"],
    });
    const tagIdByValue = new Map<string, string>(existingTags.map((t: any) => [t.value, t.id]));

    const missingTagValues = TAG_VALUES.filter((v) => !tagIdByValue.has(v));
    if (missingTagValues.length) {
        const { result: createdTags } = await createProductTagsWorkflow(container).run({
            input: { product_tags: missingTagValues.map((value) => ({ value })) },
        });
        for (const tag of createdTags as any[]) {
            tagIdByValue.set(tag.value, tag.id);
        }
        logger.info(`Tags creados: ${missingTagValues.join(", ")}`);
    } else {
        logger.info("Los 4 tags de atributos ya existen.");
    }

    const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "handle", "title", "description", "tags.id", "brand.id"],
    });

    // product id -> set of tag ids to ensure are present
    const assignments = new Map<string, Set<string>>();
    const addAssignment = (productId: string, tagId: string) => {
        const current = assignments.get(productId) ?? new Set<string>();
        current.add(tagId);
        assignments.set(productId, current);
    };

    const marcaPropiaTagId = tagIdByValue.get("Marca propia") as string;
    for (const product of products as any[]) {
        if (product.brand?.id) {
            addAssignment(product.id, marcaPropiaTagId);
        }
    }

    for (const tagValue of Object.keys(KEYWORD_PATTERNS) as KeywordTagValue[]) {
        const tagId = tagIdByValue.get(tagValue) as string;
        const pattern = KEYWORD_PATTERNS[tagValue];

        const keywordMatches = (products as any[]).filter((p) =>
            pattern.test(`${p.title} ${p.description ?? ""}`)
        );

        if (keywordMatches.length > 0) {
            for (const product of keywordMatches) {
                addAssignment(product.id, tagId);
            }
            logger.info(`"${tagValue}": ${keywordMatches.length} producto(s) por keyword match.`);
            continue;
        }

        const fallbackHandles = FALLBACK_HANDLES[tagValue];
        const fallbackMatches = (products as any[]).filter((p) => fallbackHandles.includes(p.handle));
        for (const product of fallbackMatches) {
            addAssignment(product.id, tagId);
        }
        logger.info(
            `"${tagValue}": sin match por keyword, asignado por fallback determinístico a ${fallbackMatches
                .map((p) => p.handle)
                .join(", ")}.`
        );
    }

    const productsById = new Map<string, any>((products as any[]).map((p: any) => [p.id, p]));
    const tagValueById = new Map<string, string>(
        Array.from(tagIdByValue.entries()).map(([value, id]) => [id, value])
    );
    let updatedCount = 0;
    const logLines: string[] = [];

    for (const [productId, newTagIds] of assignments.entries()) {
        const product = productsById.get(productId);
        const currentTagIds = new Set<string>((product.tags ?? []).map((t: any) => t.id as string));
        const alreadyHasAll = Array.from(newTagIds).every((id) => currentTagIds.has(id));
        if (alreadyHasAll) continue;

        const finalTagIds = Array.from(new Set([...currentTagIds, ...newTagIds]));

        await updateProductsWorkflow(container).run({
            input: {
                products: [{ id: productId, tag_ids: finalTagIds }],
            },
        });
        updatedCount++;

        const tagNames = finalTagIds.map((id) => tagValueById.get(id)).filter(Boolean);
        logLines.push(`${product.handle}: ${tagNames.join(", ")}`);
    }

    if (updatedCount === 0) {
        logger.info("Todos los productos ya tienen sus atributos asignados. Nada que actualizar.");
        return;
    }

    logger.info(`Atributos asignados/actualizados en ${updatedCount} producto(s):`);
    logLines.forEach((line) => logger.info(`  - ${line}`));
    logger.info(
        "Si algún producto no encaja con su atributo asignado, ajustalo manualmente vía admin/API — la heurística de este script es aproximada."
    );
}
