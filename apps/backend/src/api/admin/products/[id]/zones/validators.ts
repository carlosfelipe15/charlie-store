import { z } from "zod";

export const PostAdminSetProductZones = z.object({
    municipality_ids: z.array(z.string()),
})

export type PostAdminSetProductZonesType = z.infer<typeof PostAdminSetProductZones>;
