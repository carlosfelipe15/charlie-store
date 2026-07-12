import React from "react"
import { Truck } from "lucide-react"

import { IconProps } from "types/icon"

const FastDelivery: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  ...attributes
}) => {
  return <Truck size={size} color={color} strokeWidth={1.5} {...attributes} />
}

export default FastDelivery
