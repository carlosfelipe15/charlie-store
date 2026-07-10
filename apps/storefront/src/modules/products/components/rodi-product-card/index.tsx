"use client"

import {
  addToCart,
  deleteLineItem,
  updateLineItem,
} from "@lib/data/cart"
import { getCartLineForVariant } from "@lib/data/cart-line"
import { addFavorite, removeFavorite } from "@lib/data/favorites"
import {
  canQuickAddFromCard,
  getQuickAddVariantId,
} from "@lib/util/product-variant"
import { getProductBrandName } from "@lib/util/product-brand"
import { HttpTypes } from "@medusajs/types"
import { RodiBadge, RodiBtn, RodiBtnLink } from "@modules/common/components/rodi"
import { useToast } from "@modules/common/components/ui"
import { RodiIconHeart, RodiIconPlus } from "@modules/common/icons/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import RodiQtyAdder from "@modules/products/components/rodi-qty-adder"
import { clsx } from "clsx"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { VariantPrice } from "types/global"

export type RodiProductCardProps = {
  product: HttpTypes.StoreProduct
  cheapestPrice: VariantPrice | null
  isFeatured?: boolean
  isFavorited?: boolean
  /** Compact rail: FAB + on image only */
  layout?: "grid" | "compact"
}

function PriceDisplay({ price }: { price: VariantPrice }) {
  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      {price.price_type === "sale" && (
        <span
          className="text-xs text-rm-ink-4 line-through"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={clsx(
          "font-display text-lg font-extrabold tracking-tight",
          price.price_type === "sale" ? "text-rm-red" : "text-rm-ink"
        )}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </div>
  )
}

export default function RodiProductCard({
  product,
  cheapestPrice,
  isFeatured,
  isFavorited = false,
  layout = "grid",
}: RodiProductCardProps) {
  const router = useRouter()
  const { countryCode } = useParams<{ countryCode: string }>()
  const { showToast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [lineId, setLineId] = useState<string | null>(null)
  const [qty, setQty] = useState(0)
  const [favorited, setFavorited] = useState(isFavorited)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  const quickAddVariantId = getQuickAddVariantId(product)
  const quickAdd = canQuickAddFromCard(product)
  const brandName = getProductBrandName(product)
  const onSale = cheapestPrice?.price_type === "sale"
  const saleLabel =
    onSale && cheapestPrice?.percentage_diff
      ? `−${cheapestPrice.percentage_diff}%`
      : "Oferta"

  const syncCartLine = useCallback(async () => {
    if (!quickAddVariantId) return
    const line = await getCartLineForVariant(quickAddVariantId)
    if (line) {
      setLineId(line.lineId)
      setQty(line.quantity)
    } else {
      setLineId(null)
      setQty(0)
    }
  }, [quickAddVariantId])

  useEffect(() => {
    if (quickAdd) {
      syncCartLine()
    }
  }, [quickAdd, syncCartLine])

  const refreshCart = () => {
    router.refresh()
    syncCartLine()
  }

  const handleAdd = async () => {
    if (!quickAddVariantId || !countryCode) return

    setIsAdding(true)
    try {
      await addToCart({
        variantId: quickAddVariantId,
        quantity: 1,
        countryCode,
      })
      await syncCartLine()
      refreshCart()
    } finally {
      setIsAdding(false)
    }
  }

  const handleIncrease = async () => {
    if (!quickAddVariantId || !countryCode) return

    setIsAdding(true)
    try {
      if (lineId) {
        await updateLineItem({ lineId, quantity: qty + 1 })
      } else {
        await addToCart({
          variantId: quickAddVariantId,
          quantity: 1,
          countryCode,
        })
      }
      await syncCartLine()
      refreshCart()
    } finally {
      setIsAdding(false)
    }
  }

  const handleDecrease = async () => {
    if (!lineId || qty <= 0) return

    setIsAdding(true)
    try {
      if (qty <= 1) {
        await deleteLineItem(lineId)
        setLineId(null)
        setQty(0)
      } else {
        await updateLineItem({ lineId, quantity: qty - 1 })
      }
      await syncCartLine()
      refreshCart()
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true)
    const wasFavorited = favorited
    setFavorited(!wasFavorited)

    const result = wasFavorited
      ? await removeFavorite(product.id)
      : await addFavorite(product.id)

    if (!result.success) {
      setFavorited(wasFavorited)
      showToast(result.error ?? "No se pudo actualizar tus favoritos.", "error")
    } else {
      router.refresh()
    }

    setIsTogglingFavorite(false)
  }

  const stopNav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const showQty = quickAdd && qty > 0 && lineId
  const isCompact = layout === "compact"

  return (
    <article
      data-testid="product-wrapper"
      className={clsx(
        "relative flex flex-col bg-rm-paper border border-rm-line rounded-rm-lg",
        isCompact ? "w-[138px] shrink-0 p-2 gap-1.5" : "p-3 gap-2.5"
      )}
    >
      {onSale && (
        <div
          className={clsx(
            "absolute z-10",
            isCompact ? "top-3 left-3" : "top-3.5 left-3.5"
          )}
        >
          <RodiBadge kind="sale" className={isCompact ? "text-[9px] px-1.5" : ""}>
            {saleLabel}
          </RodiBadge>
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          stopNav(e)
          void handleToggleFavorite()
        }}
        disabled={isTogglingFavorite}
        className={clsx(
          "absolute z-10 grid place-items-center rounded-full bg-rm-paper/90 backdrop-blur-sm shadow-sm disabled:opacity-60",
          isCompact ? "top-3 right-3 w-7 h-7" : "top-3.5 right-3.5 w-8 h-8"
        )}
        aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
        aria-pressed={favorited}
        data-testid="product-card-favorite-toggle"
      >
        <RodiIconHeart
          size={isCompact ? 14 : 16}
          filled={favorited}
          className={favorited ? "text-rm-red" : "text-rm-ink-3"}
        />
      </button>

      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block group/thumb"
      >
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          variant="rodi"
          isFeatured={isFeatured}
        />
      </LocalizedClientLink>

      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="flex flex-col gap-1 min-h-[2.4em] flex-1"
      >
        {brandName && (
          <span
            className={clsx(
              "font-semibold uppercase tracking-wide text-rm-ink-4",
              isCompact ? "text-[9px]" : "text-[10px]"
            )}
            data-testid="product-brand"
          >
            {brandName}
          </span>
        )}
        <p
          className={clsx(
            "font-semibold leading-snug text-rm-ink line-clamp-2 text-balance",
            isCompact ? "text-xs" : "text-[14px]"
          )}
          data-testid="product-title"
        >
          {product.title}
        </p>
        {cheapestPrice && <PriceDisplay price={cheapestPrice} />}
      </LocalizedClientLink>

      {isCompact ? (
        <div className="absolute right-2 bottom-2 z-10">
          {showQty ? (
            <div className="flex items-center gap-0.5 bg-rm-red text-white rounded-full px-1 h-8">
              <button
                type="button"
                onClick={(e) => {
                  stopNav(e)
                  void handleDecrease()
                }}
                disabled={isAdding}
                className="w-7 h-7 grid place-items-center"
                aria-label="Menos"
              >
                <span className="text-sm font-bold">−</span>
              </button>
              <span className="text-xs font-extrabold min-w-[14px] text-center">
                {qty}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  stopNav(e)
                  void handleIncrease()
                }}
                disabled={isAdding}
                className="w-7 h-7 grid place-items-center"
                aria-label="Más"
              >
                <RodiIconPlus size={14} />
              </button>
            </div>
          ) : quickAdd ? (
            <button
              type="button"
              onClick={(e) => {
                stopNav(e)
                void handleAdd()
              }}
              disabled={isAdding}
              className="w-8 h-8 rounded-full bg-rm-red text-white border-0 grid place-items-center cursor-pointer shadow-[0_2px_8px_rgba(230,57,70,0.4)] disabled:opacity-60"
              aria-label="Agregar al carrito"
            >
              <RodiIconPlus size={14} />
            </button>
          ) : (
            <LocalizedClientLink href={`/products/${product.handle}`}>
              <span className="w-8 h-8 rounded-full bg-rm-ink text-white grid place-items-center text-lg font-bold">
                +
              </span>
            </LocalizedClientLink>
          )}
        </div>
      ) : (
        <div className="mt-auto pt-1" onClick={stopNav}>
          {showQty ? (
            <RodiQtyAdder
              quantity={qty}
              onIncrease={() => void handleIncrease()}
              onDecrease={() => void handleDecrease()}
              disabled={isAdding}
            />
          ) : quickAdd ? (
            <RodiBtn
              kind="dark"
              size="sm"
              fullWidth
              className="!h-[38px]"
              onClick={() => void handleAdd()}
              disabled={isAdding}
              data-testid="add-product-card-button"
            >
              <RodiIconPlus size={14} />
              {isAdding ? "Agregando…" : "Agregar"}
            </RodiBtn>
          ) : (
            <RodiBtnLink
              href={`/products/${product.handle}`}
              kind="dark"
              size="sm"
              fullWidth
              className="!h-[38px]"
            >
              Elegir opciones
            </RodiBtnLink>
          )}
        </div>
      )}
    </article>
  )
}
