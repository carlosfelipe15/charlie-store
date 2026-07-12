import React from "react"
import { ChevronsUpDown } from "lucide-react"

import { IconProps } from "types/icon"

const ChevronUpDown: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <ChevronsUpDown size={size} color={color} strokeWidth={1.5} {...attributes} />
  )
}

export default ChevronUpDown
