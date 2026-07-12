import React from "react"
import { ArrowLeft } from "lucide-react"

import { IconProps } from "types/icon"

const Back: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  ...attributes
}) => {
  return <ArrowLeft size={size} color={color} strokeWidth={1.5} {...attributes} />
}

export default Back
