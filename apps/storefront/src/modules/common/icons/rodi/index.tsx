import React from "react"
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  Heart,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react"

import { IconProps } from "types/icon"

type RodiIconProps = Omit<IconProps, "direction"> & {
  chevronDirection?: "down" | "up" | "left" | "right"
  filled?: boolean
}

export const RodiIconSearch: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Search size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconCart: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <ShoppingCart size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconUser: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <User size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconHeart: React.FC<RodiIconProps> = ({
  filled = false,
  size = 18,
  ...props
}) => (
  <Heart
    size={size}
    strokeWidth={1.75}
    fill={filled ? "currentColor" : "none"}
    {...props}
  />
)

export const RodiIconPin: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <MapPin size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconTruck: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Truck size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconChevron: React.FC<RodiIconProps> = ({
  chevronDirection = "down",
  size = 16,
  style,
  ...props
}) => {
  const rotate = { down: 0, up: 180, left: 90, right: -90 }[chevronDirection]
  return (
    <ChevronDown
      size={size}
      strokeWidth={2}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
      {...props}
    />
  )
}

export const RodiIconMenu: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Menu size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconPlus: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Plus size={size} strokeWidth={2} {...props} />
)

export const RodiIconMinus: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Minus size={size} strokeWidth={2} {...props} />
)

export const RodiIconCheck: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Check size={size} strokeWidth={2.25} {...props} />
)

export const RodiIconX: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <X size={size} strokeWidth={2} {...props} />
)

export const RodiIconStar: React.FC<RodiIconProps> = ({
  filled = true,
  size = 18,
  ...props
}) => (
  <Star
    size={size}
    strokeWidth={1.5}
    fill={filled ? "currentColor" : "none"}
    {...props}
  />
)

export const RodiIconShield: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Shield size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconBolt: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Zap size={size} fill="currentColor" stroke="none" {...props} />
)

export const RodiIconLeaf: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Leaf size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconBack: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <ChevronLeft size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconFilter: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <SlidersHorizontal size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconSort: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <ArrowUpDown size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconBag: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <ShoppingBag size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconDashboard: React.FC<IconProps> = ({
  size = 18,
  ...props
}) => <LayoutDashboard size={size} strokeWidth={1.75} {...props} />

export const RodiIconPackage: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <Package size={size} strokeWidth={1.75} {...props} />
)

export const RodiIconLogOut: React.FC<IconProps> = ({ size = 18, ...props }) => (
  <LogOut size={size} strokeWidth={1.75} {...props} />
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
  { name: "dashboard", Icon: RodiIconDashboard },
  { name: "package", Icon: RodiIconPackage },
  { name: "logout", Icon: RodiIconLogOut },
]
