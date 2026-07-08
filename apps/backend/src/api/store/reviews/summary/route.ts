import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

type ReviewSummary = {
    product_id: string | null;
    average: number;
    count: number;
    distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
}

// Aggregate rating average + count + star distribution. Backs the PDP rating
// display (with `product_id`) and the sitewide "X reseñas" marketing stat
// (without it, aggregating across all products) — both cite a real number
// instead of hardcoded copy once reviews exist.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const productId = req.query.product_id as string | undefined;

    const query = req.scope.resolve("query")

    const { data: reviews } = await query.graph({
        entity: "review",
        fields: ["rating"],
        ...(productId ? { filters: { product_id: productId } } : {}),
        pagination: { take: 10000, skip: 0 },
    })

    const distribution: ReviewSummary["distribution"] = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
    };

    let total = 0;
    for (const review of reviews) {
        const bucket = String(
            Math.min(5, Math.max(1, Math.round(review.rating)))
        ) as keyof typeof distribution;
        distribution[bucket] += 1;
        total += review.rating;
    }

    const count = reviews.length;
    const average = count > 0 ? Math.round((total / count) * 10) / 10 : 0;

    const summary: ReviewSummary = {
        product_id: productId ?? null,
        average,
        count,
        distribution,
    };

    res.json(summary);
}
