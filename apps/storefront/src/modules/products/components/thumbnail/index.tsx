import { Container, clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  /** Rodi product card: 1:1, bordered, rounded */
  variant?: "default" | "rodi"
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  variant = "default",
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url
  const isRodi = variant === "rodi"

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden transition-shadow ease-in-out duration-150",
        isRodi
          ? "aspect-square p-0 bg-rm-paper border border-rm-line rounded-rm-lg group-hover:shadow-md"
          : "p-4 bg-ui-bg-subtle shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover",
        className,
        !isRodi && {
          "aspect-[11/14]": isFeatured,
          "aspect-[9/16]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        },
        isRodi && {
          "w-full": size === "full" || size === "square",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} variant={variant} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  variant = "default",
}: Pick<ThumbnailProps, "size" | "variant"> & { image?: string }) => {
  return image ? (
    <Image
      src={image}
      alt="Thumbnail"
      className={clx(
        "absolute inset-0 object-cover object-center",
        variant === "rodi" && "rounded-rm-lg"
      )}
      draggable={false}
      quality={50}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
