"use client"

import { addFavorite, removeFavorite } from "@lib/data/favorites"
import { HttpTypes } from "@medusajs/types"
import { useToast } from "@modules/common/components/ui"
import { RodiIconHeart } from "@modules/common/icons/rodi"
import { clsx } from "clsx"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type RodiImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productId?: string
  isFavorited?: boolean
  /**
   * Small, contained packshot instead of the large hero image — for
   * everyday grocery items where the photo doesn't carry purchase-decision
   * weight the way it does for apparel/appliances. See
   * lib/util/product.ts#shouldUseCompactGallery.
   */
  compact?: boolean
}

export default function RodiImageGallery({
  images,
  productId,
  isFavorited = false,
  compact = false,
}: RodiImageGalleryProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const validImages = images.filter((img) => img.url)
  const [activeIndex, setActiveIndex] = useState(0)
  const [favorited, setFavorited] = useState(isFavorited)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const active = validImages[activeIndex]

  const handleToggleFavorite = async () => {
    if (!productId) return

    setIsTogglingFavorite(true)
    const wasFavorited = favorited
    setFavorited(!wasFavorited)

    const result = wasFavorited
      ? await removeFavorite(productId)
      : await addFavorite(productId)

    if (!result.success) {
      setFavorited(wasFavorited)
      showToast(result.error ?? "No se pudo actualizar tus favoritos.", "error")
    } else {
      router.refresh()
    }

    setIsTogglingFavorite(false)
  }

  if (!validImages.length) {
    return (
      <div className="aspect-square bg-rm-line-2 rounded-rm-lg flex items-center justify-center border border-rm-line">
        <PlaceholderImage size={48} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[72px_1fr] gap-3">
      <div className="flex flex-col gap-2">
        {validImages.map((image, index) => (
          <button
            key={image.id ?? index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={clsx(
              "rounded-[10px] p-1 border-2 transition-colors overflow-hidden",
              index === activeIndex ? "border-rm-ink" : "border-rm-line"
            )}
            aria-label={`Imagen ${index + 1}`}
          >
            <div className="relative aspect-square w-full bg-rm-line-2 rounded-md overflow-hidden">
              {image.url && (
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              )}
            </div>
          </button>
        ))}
      </div>

      <div
        className={clsx(
          "relative bg-rm-paper border border-rm-line rounded-rm-lg aspect-square",
          compact ? "max-w-[420px] p-10 md:p-12" : "p-4 md:p-6"
        )}
      >
        {productId && (
          <button
            type="button"
            onClick={() => void handleToggleFavorite()}
            disabled={isTogglingFavorite}
            className="absolute top-4 right-4 z-10 grid place-items-center w-10 h-10 rounded-full bg-rm-paper/90 backdrop-blur-sm shadow-sm disabled:opacity-60"
            aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={favorited}
            data-testid="pdp-gallery-favorite-toggle"
          >
            <RodiIconHeart
              size={20}
              filled={favorited}
              className={favorited ? "text-rm-red" : "text-rm-ink-3"}
            />
          </button>
        )}
        {active?.url && (
          <Image
            src={active.url}
            alt="Producto"
            fill
            priority
            className={clsx(
              "rounded-rm-md",
              compact ? "object-contain" : "object-cover"
            )}
            sizes={compact ? "420px" : "(max-width: 768px) 100vw, 50vw"}
          />
        )}
      </div>
    </div>
  )
}
