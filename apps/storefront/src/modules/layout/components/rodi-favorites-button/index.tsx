import { listCustomerFavorites } from "@lib/data/favorites"
import { RodiIconHeart } from "@modules/common/icons/rodi"
import { RodiHeaderAction } from "@modules/layout/components/rodi-header-action"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function RodiFavoritesButton() {
  const favorites = await listCustomerFavorites()

  return (
    <LocalizedClientLink
      href="/account/favorites"
      data-testid="nav-favorites-link"
      className="hidden small:block"
    >
      <RodiHeaderAction
        icon={<RodiIconHeart size={20} />}
        label="Favoritos"
        sub={favorites.length ? `${favorites.length} guardados` : "Guardados"}
        badge={favorites.length}
      />
    </LocalizedClientLink>
  )
}
