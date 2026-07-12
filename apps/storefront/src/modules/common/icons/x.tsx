import React from "react"
import { X as LucideX } from "lucide-react"

import { IconProps } from "types/icon"

const X: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return <LucideX size={size} color={color} strokeWidth={1.5} {...attributes} />
}

export default X
