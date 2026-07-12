import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http";
import { PostStoreCreateFavoriteType } from "./validators";
import { createFavoriteWorkflow } from "../../../workflows/create-favorite";

export const POST = async (
    req: AuthenticatedMedusaRequest<PostStoreCreateFavoriteType>,
    res: MedusaResponse
) => {
    const customerId = req.auth_context.actor_id;

    const { result } = await createFavoriteWorkflow(req.scope).run({
        input: {
            product_id: req.validatedBody.product_id,
            customer_id: customerId,
        },
    })

    res.json({ favorite: result });
}

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve("query")
    const customerId = req.auth_context.actor_id;

    const {
        data: favorites,
        metadata: { take, skip } = {},
    } = await query.graph({
        entity: "favorite",
        filters: { customer_id: customerId },
        ...req.queryConfig,
    })

    // Excludes favorites whose product is no longer published (unpublished
    // from admin, or hard-deleted) — the favorite row itself is left alone
    // (unfavoriting still works, and it reappears if republished), but it
    // shouldn't count toward "N favoritos" or show up in the favorites list
    // when the product isn't actually visible in the store. query.graph()
    // can't filter "favorite" by a linked module's field (product.status),
    // so this is a second query + in-memory filter rather than a single
    // query.graph filters clause — see AGENTS.md "Índice de búsqueda
    // cross-módulo" for why cross-module filters don't work at the
    // query.graph() level.
    let visibleFavorites = favorites;
    if (favorites.length) {
        const { data: products } = await query.graph({
            entity: "product",
            fields: ["id", "status"],
            filters: { id: favorites.map((f) => f.product_id) },
        })
        const publishedIds = new Set(
            products.filter((p) => p.status === "published").map((p) => p.id)
        )
        visibleFavorites = favorites.filter((f) => publishedIds.has(f.product_id))
    }

    res.json({
        favorites: visibleFavorites,
        count: visibleFavorites.length,
        limit: take,
        offset: skip,
    });
}
