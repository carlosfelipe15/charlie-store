import React from "react"
import { Eye as LucideEye } from "lucide-react"

import { IconProps } from "types/icon"

const Eye: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return <LucideEye size={size} color={color} strokeWidth={1.5} {...attributes} />
}

export default Eye
