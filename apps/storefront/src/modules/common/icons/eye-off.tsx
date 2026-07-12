import React from "react"
import { EyeOff as LucideEyeOff } from "lucide-react"

import { IconProps } from "types/icon"

const EyeOff: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <LucideEyeOff size={size} color={color} strokeWidth={1.5} {...attributes} />
  )
}

export default EyeOff
