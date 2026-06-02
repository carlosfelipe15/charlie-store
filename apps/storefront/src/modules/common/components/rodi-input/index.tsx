"use client"

import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"
import { clsx } from "clsx"
import React, { useEffect, useState } from "react"

type RodiInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label: string
}

const RodiInput = React.forwardRef<HTMLInputElement, RodiInputProps>(
  ({ type = "text", label, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputType =
      type === "password" ? (showPassword ? "text" : "password") : type

    useEffect(() => {
      if (type !== "password") return
    }, [type, showPassword])

    return (
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-extrabold text-rm-ink-3 uppercase tracking-wider">
          {label}
        </label>
        <div className="relative flex items-center h-[42px] bg-rm-paper border-[1.5px] border-rm-line rounded-lg px-3 focus-within:border-rm-ink">
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              "flex-1 border-0 outline-none bg-transparent text-sm text-rm-ink placeholder:text-rm-ink-4",
              className
            )}
            {...props}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-rm-ink-3 hover:text-rm-ink shrink-0"
              tabIndex={-1}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)
RodiInput.displayName = "RodiInput"

export default RodiInput
