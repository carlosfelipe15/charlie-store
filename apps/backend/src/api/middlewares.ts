import {
    authenticate,
    defineMiddlewares,
    validateAndTransformBody,
    validateAndTransformQuery
} from "@medusajs/framework/http";
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { PostAdminCreateBrand, PostAdminUpdateBrand } from "./admin/brands/validators";
import { PostStoreCreateReview, GetStoreReviewsParams } from "./store/reviews/validators";
import { PostStoreCreateFavorite, GetStoreFavoritesParams } from "./store/favorites/validators";
import { PostStoreZoneEligibilityCheck } from "./store/zones/validators";
import { PostAdminSetProductZones } from "./admin/products/[id]/zones/validators";
import { storeProductsWithBrandMiddlewares } from "./store/products-list/middlewares";
import { z } from "zod";

export const GetBrandsSchema = createFindParams()

export default defineMiddlewares({
    routes: [
        ...storeProductsWithBrandMiddlewares,
        {
            matcher: "/admin/brands",
            method: "POST",
            middlewares: [validateAndTransformBody(PostAdminCreateBrand)],
        },
        {
            matcher: "/admin/brands",
            method: "GET",
            middlewares: [
                validateAndTransformQuery(GetBrandsSchema, {
                    defaults: ["id", "name", "products.*"],
                    isList: true,
                }),
            ],
        },
        {
            matcher: "/admin/brands/:id",
            method: "POST",
            middlewares: [validateAndTransformBody(PostAdminUpdateBrand)],
        },
        {
            matcher: "/store/brands",
            method: "GET",
            middlewares: [
                validateAndTransformQuery(GetBrandsSchema, {
                    defaults: ["id", "name"],
                    isList: true,
                }),
            ],
        },
        {
            matcher: "/store/reviews",
            method: "GET",
            middlewares: [
                validateAndTransformQuery(GetStoreReviewsParams, {
                    defaults: ["id", "product_id", "customer_id", "rating", "title", "body", "created_at"],
                    isList: true,
                }),
            ],
        },
        {
            matcher: "/store/reviews",
            method: "POST",
            middlewares: [
                authenticate("customer", ["session", "bearer"]),
                validateAndTransformBody(PostStoreCreateReview),
            ],
        },
        {
            matcher: "/store/reviews/:id",
            method: "DELETE",
            middlewares: [
                authenticate("customer", ["session", "bearer"]),
            ],
        },
        {
            matcher: "/store/favorites",
            method: "GET",
            middlewares: [
                authenticate("customer", ["session", "bearer"]),
                validateAndTransformQuery(GetStoreFavoritesParams, {
                    defaults: ["id", "product_id", "customer_id", "created_at"],
                    isList: true,
                }),
            ],
        },
        {
            matcher: "/store/favorites",
            method: "POST",
            middlewares: [
                authenticate("customer", ["session", "bearer"]),
                validateAndTransformBody(PostStoreCreateFavorite),
            ],
        },
        {
            matcher: "/store/favorites/:product_id",
            method: "DELETE",
            middlewares: [
                authenticate("customer", ["session", "bearer"]),
            ],
        },
        {
            matcher: "/store/zones/eligibility-check",
            method: "POST",
            middlewares: [validateAndTransformBody(PostStoreZoneEligibilityCheck)],
        },
        {
            matcher: "/admin/products/:id/zones",
            method: "POST",
            middlewares: [validateAndTransformBody(PostAdminSetProductZones)],
        },
        {
            matcher: "/admin/products",
            method: "POST",
            additionalDataValidator: {
                brand_id: z.string().optional()
            }
        },
        {
            matcher: "/admin/products/:id",
            method: "POST",
            additionalDataValidator: {
                brand_id: z.string().nullable().optional()
            }
        },
    ],
})