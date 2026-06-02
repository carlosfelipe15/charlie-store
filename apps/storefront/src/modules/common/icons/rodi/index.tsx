import React from "react"

import { IconProps } from "types/icon"

type RodiIconProps = Omit<IconProps, "direction"> & {
  chevronDirection?: "down" | "up" | "left" | "right"
  filled?: boolean
}

const stroke = {
  round: {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  },
}

function Svg({
  size = 18,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  const dim = typeof size === "number" ? size : parseInt(size, 10) || 18
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const RodiIconSearch: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7" {...stroke.round} />
    <path d="m20 20-3.5-3.5" {...stroke.round} />
  </Svg>
)

export const RodiIconCart: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M3 4h2l2.5 12h11L21 8H6.5"
      {...stroke.round}
    />
    <circle cx="9" cy="20" r="1.4" {...stroke.round} />
    <circle cx="18" cy="20" r="1.4" {...stroke.round} />
  </Svg>
)

export const RodiIconUser: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8" r="4" {...stroke.round} />
    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" {...stroke.round} />
  </Svg>
)

export const RodiIconHeart: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
      {...stroke.round}
    />
  </Svg>
)

export const RodiIconPin: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z"
      {...stroke.round}
    />
    <circle cx="12" cy="9" r="2.5" {...stroke.round} />
  </Svg>
)

export const RodiIconTruck: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" {...stroke.round} />
    <circle cx="7" cy="18" r="1.6" {...stroke.round} />
    <circle cx="17" cy="18" r="1.6" {...stroke.round} />
  </Svg>
)

export const RodiIconChevron: React.FC<RodiIconProps> = ({
  chevronDirection = "down",
  size = 16,
  ...props
}) => {
  const rotate = { down: 0, up: 180, left: 90, right: -90 }[chevronDirection]
  return (
    <Svg size={size} style={{ transform: `rotate(${rotate}deg)` }} {...props}>
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export const RodiIconMenu: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M4 7h16M4 12h16M4 17h16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
    />
  </Svg>
)

export const RodiIconPlus: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M12 5v14M5 12h14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
)

export const RodiIconMinus: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M5 12h14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
)

export const RodiIconCheck: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="m5 12 4 4 10-10"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

export const RodiIconX: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M6 6l12 12M18 6 6 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
)

export const RodiIconStar: React.FC<RodiIconProps> = ({
  filled = true,
  ...props
}) => (
  <Svg {...props}>
    <path
      d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.4 20.3l1.1-6.3L2.9 9.6l6.3-.9Z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
)

export const RodiIconShield: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6Z" {...stroke.round} />
  </Svg>
)

export const RodiIconBolt: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6Z" fill="currentColor" />
  </Svg>
)

export const RodiIconLeaf: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M20 4s-2 14-11 16C5 21 3 16 4 12 5 7 11 4 20 4Z"
      {...stroke.round}
    />
    <path d="M4 20 14 10" {...stroke.round} />
  </Svg>
)

export const RodiIconBack: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path d="M15 6l-6 6 6 6" {...stroke.round} />
  </Svg>
)

export const RodiIconFilter: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M4 6h16M7 12h10M10 18h4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
    />
  </Svg>
)

export const RodiIconSort: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path
      d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"
      {...stroke.round}
    />
  </Svg>
)

export const RodiIconBag: React.FC<IconProps> = (props) => (
  <Svg {...props}>
    <path d="M5 7h14l-1 13H6Z" {...stroke.round} />
    <path d="M9 7a3 3 0 1 1 6 0" {...stroke.round} />
  </Svg>
)

/** All Rodi icons for the design-system gallery */
export const rodiIconGallery: {
  name: string
  Icon: React.FC<IconProps>
}[] = [
  { name: "search", Icon: RodiIconSearch },
  { name: "cart", Icon: RodiIconCart },
  { name: "user", Icon: RodiIconUser },
  { name: "heart", Icon: RodiIconHeart },
  { name: "pin", Icon: RodiIconPin },
  { name: "truck", Icon: RodiIconTruck },
  { name: "chevron", Icon: RodiIconChevron },
  { name: "menu", Icon: RodiIconMenu },
  { name: "plus", Icon: RodiIconPlus },
  { name: "minus", Icon: RodiIconMinus },
  { name: "check", Icon: RodiIconCheck },
  { name: "x", Icon: RodiIconX },
  { name: "star", Icon: RodiIconStar },
  { name: "shield", Icon: RodiIconShield },
  { name: "bolt", Icon: RodiIconBolt },
  { name: "leaf", Icon: RodiIconLeaf },
  { name: "back", Icon: RodiIconBack },
  { name: "filter", Icon: RodiIconFilter },
  { name: "sort", Icon: RodiIconSort },
  { name: "bag", Icon: RodiIconBag },
]
