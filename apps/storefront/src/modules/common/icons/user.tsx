import React from "react"
import { User as LucideUser } from "lucide-react"

import { IconProps } from "types/icon"

const User: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <LucideUser size={size} color={color} strokeWidth={1.5} {...attributes} />
  )
}

export default User
