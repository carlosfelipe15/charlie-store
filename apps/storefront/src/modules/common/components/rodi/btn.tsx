import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ButtonHTMLAttributes, ComponentProps, forwardRef } from "react"

import {
  rodiBtnClassName,
  RodiBtnKind,
  RodiBtnSize,
} from "./variants"

export type RodiBtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: RodiBtnKind
  size?: RodiBtnSize
  fullWidth?: boolean
}

export const RodiBtn = forwardRef<HTMLButtonElement, RodiBtnProps>(
  (
    { kind = "primary", size = "md", fullWidth, className, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={rodiBtnClassName({ kind, size, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  )
)
RodiBtn.displayName = "RodiBtn"

export type RodiBtnLinkProps = ComponentProps<typeof LocalizedClientLink> & {
  kind?: RodiBtnKind
  size?: RodiBtnSize
  fullWidth?: boolean
}

export function RodiBtnLink({
  kind = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: RodiBtnLinkProps) {
  return (
    <LocalizedClientLink
      className={rodiBtnClassName({ kind, size, fullWidth, className })}
      {...props}
    >
      {children}
    </LocalizedClientLink>
  )
}
