import React from "react"
import { Trash2 } from "lucide-react"

import { IconProps } from "types/icon"

const Trash: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  ...attributes
}) => {
  return <Trash2 size={size} color={color} strokeWidth={1.5} {...attributes} />
}

export default Trash
