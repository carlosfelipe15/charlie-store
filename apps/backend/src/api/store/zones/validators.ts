import { z } from "zod";

export const PostStoreZoneEligibilityCheck = z.object({
    zone_id: z.string(),
    product_ids: z.array(z.string()).min(1),
})

export type PostStoreZoneEligibilityCheckType = z.infer<typeof PostStoreZoneEligibilityCheck>;
