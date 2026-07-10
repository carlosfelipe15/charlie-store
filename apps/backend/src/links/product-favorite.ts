import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import FavoriteModule from "../modules/favorite";

export default defineLink(
    ProductModule.linkable.product,
    {
        linkable: FavoriteModule.linkable.favorite,
        isList: true,
    }
)
