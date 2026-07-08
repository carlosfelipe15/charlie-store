import {
    authenticate,
    defineMiddlewares,
    validateAndTransformBody,
    validateAndTransformQuery
} from "@medusajs/framework/http";
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { PostAdminCreateBrand, PostAdminUpdateBrand } from "./admin/brands/validators";
import { PostStoreCreateReview, GetStoreReviewsParams } from "./store/reviews/validators";
import { z } from "zod";

export const GetBrandsSchema = createFindParams()

export default defineMiddlewares({
    routes: [
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