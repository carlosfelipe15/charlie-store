"use client"

import { HttpTypes } from "@medusajs/types"
import { clsx } from "clsx"
import Image from "next/image"
import { useState } from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type RodiImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

export default function RodiImageGallery({ images }: RodiImageGalleryProps) {
  const validImages = images.filter((img) => img.url)
  const [activeIndex, setActiveIndex] = useState(0)
  const active = validImages[activeIndex]

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

      <div className="relative bg-rm-paper border border-rm-line rounded-rm-lg p-4 md:p-6 aspect-square">
        {active?.url && (
          <Image
            src={active.url}
            alt="Producto"
            fill
            priority
            className="object-cover rounded-rm-md"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>
    </div>
  )
}
