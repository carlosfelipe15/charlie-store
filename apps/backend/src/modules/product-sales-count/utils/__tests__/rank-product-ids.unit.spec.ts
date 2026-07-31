import { rankProductIds } from "../get-product-sales-ranking";

describe("rankProductIds", () => {
    it("orders ids descending by units sold", () => {
        const ranking = new Map([
            ["prod_a", 5],
            ["prod_b", 20],
            ["prod_c", 1],
        ]);

        expect(rankProductIds(["prod_a", "prod_b", "prod_c"], ranking)).toEqual([
            "prod_b",
            "prod_a",
            "prod_c",
        ]);
    });

    it("treats products with no ranking entry as 0 units sold and sorts them last", () => {
        const ranking = new Map([["prod_a", 5]]);

        expect(rankProductIds(["prod_b", "prod_a", "prod_c"], ranking)).toEqual([
            "prod_a",
            "prod_b",
            "prod_c",
        ]);
    });

    it("breaks ties by id, ascending, for deterministic pagination", () => {
        const ranking = new Map([
            ["prod_b", 3],
            ["prod_a", 3],
        ]);

        expect(rankProductIds(["prod_b", "prod_a"], ranking)).toEqual([
            "prod_a",
            "prod_b",
        ]);
    });

    it("does not mutate the input array", () => {
        const ids = ["prod_b", "prod_a"];
        const ranking = new Map([
            ["prod_a", 1],
            ["prod_b", 2],
        ]);

        rankProductIds(ids, ranking);

        expect(ids).toEqual(["prod_b", "prod_a"]);
    });

    it("returns an empty array for an empty input", () => {
        expect(rankProductIds([], new Map())).toEqual([]);
    });
});
