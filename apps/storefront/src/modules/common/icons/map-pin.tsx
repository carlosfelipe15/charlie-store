import React from "react"
import { MapPin as LucideMapPin } from "lucide-react"

import { IconProps } from "types/icon"

const MapPin: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <LucideMapPin size={size} color={color} strokeWidth={1.5} {...attributes} />
  )
}

export default MapPin
