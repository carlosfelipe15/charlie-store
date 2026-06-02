"use client"

import { RodiBtn } from "@modules/common/components/rodi"
import React from "react"
import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | null
  size?: "small" | "medium" | "large"
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <RodiBtn
      type="submit"
      kind="primary"
      size="lg"
      fullWidth
      disabled={pending}
      className={className}
      data-testid={dataTestId}
    >
      {pending ? "Procesando…" : children}
    </RodiBtn>
  )
}
