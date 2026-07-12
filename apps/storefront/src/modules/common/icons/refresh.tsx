import React from "react"
import { RefreshCw } from "lucide-react"

import { IconProps } from "types/icon"

const Refresh: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  ...attributes
}) => {
  return <RefreshCw size={size} color={color} strokeWidth={1.5} {...attributes} />
}

export default Refresh
