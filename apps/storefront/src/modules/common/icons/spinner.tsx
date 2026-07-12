import React from "react"
import { Loader2 } from "lucide-react"
import { clsx } from "clsx"

import { IconProps } from "types/icon"

const Spinner: React.FC<IconProps> = ({
  size = "16",
  color = "currentColor",
  className,
  ...attributes
}) => {
  return (
    <Loader2
      size={size}
      color={color}
      className={clsx("animate-spin", className)}
      {...attributes}
    />
  )
}

export default Spinner
