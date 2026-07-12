import React from "react"
import { ImageOff } from "lucide-react"

import { IconProps } from "types/icon"

const PlaceholderImage: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <ImageOff size={size} color={color} strokeWidth={1.5} {...attributes} />
  )
}

export default PlaceholderImage
