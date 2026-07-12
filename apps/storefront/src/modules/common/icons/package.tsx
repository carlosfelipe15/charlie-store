import React from "react"
import { Package as LucidePackage } from "lucide-react"

import { IconProps } from "types/icon"

const Package: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <LucidePackage size={size} color={color} strokeWidth={1.5} {...attributes} />
  )
}

export default Package
