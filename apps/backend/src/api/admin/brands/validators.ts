import { z } from "zod";

export const PostAdminCreateBrand = z.object({
    name: z.string(),
})

export type PostAdminCreateBrandType = z.infer<typeof PostAdminCreateBrand>;

export const PostAdminUpdateBrand = z.object({
    name: z.string(),
})

export type PostAdminUpdateBrandType = z.infer<typeof PostAdminUpdateBrand>;