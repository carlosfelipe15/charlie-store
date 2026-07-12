import React from "react"
import { ChevronDown as LucideChevronDown } from "lucide-react"

import { IconProps } from "types/icon"

const ChevronDown: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <LucideChevronDown
      size={size}
      color={color}
      strokeWidth={1.5}
      {...attributes}
    />
  )
}

export default ChevronDown
