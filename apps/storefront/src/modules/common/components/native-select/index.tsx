import { ChevronUpDown } from "@medusajs/icons"
import { Label, clx } from "@modules/common/components/ui"
import {
  SelectHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

export type NativeSelectProps = {
  placeholder?: string
  /** Label shown above the select, matching Input's `topLabel`. */
  topLabel?: string
  /**
   * Floating label rendered INSIDE the select box, matching Input's `label`
   * (Nombre/Dirección/etc.) — since `<select>` has no `:placeholder-shown`,
   * this is driven by JS state (focus/has-value) instead of CSS.
   */
  label?: string
  required?: boolean
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
} & SelectHTMLAttributes<HTMLSelectElement>

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      placeholder = "Select...",
      topLabel,
      label,
      required,
      defaultValue,
      className,
      children,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [isPlaceholder, setIsPlaceholder] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    useEffect(() => {
      if (innerRef.current && innerRef.current.value === "") {
        setIsPlaceholder(true)
      } else {
        setIsPlaceholder(false)
      }
    }, [innerRef.current?.value])

    const floated = isFocused || !isPlaceholder

    return (
      <div className="flex flex-col w-full">
        {topLabel && (
          <Label className="mb-2 txt-compact-medium-plus">{topLabel}</Label>
        )}
        <div
          onFocus={() => innerRef.current?.focus()}
          onBlur={() => innerRef.current?.blur()}
          className={clx(
            "relative flex items-center text-base-regular border border-ui-border-base bg-ui-bg-subtle rounded-md hover:bg-ui-bg-field-hover",
            className,
            {
              "text-ui-fg-muted": isPlaceholder && !label,
            }
          )}
        >
          <select
            ref={innerRef}
            defaultValue={defaultValue}
            required={required}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
            {...props}
            className={clx(
              "appearance-none flex-1 bg-transparent border-none transition-colors duration-150 outline-none",
              label ? "pt-4 pb-1 px-4 h-11" : "px-4 py-2.5"
            )}
          >
            <option disabled value="">
              {label ? "" : placeholder}
            </option>
            {children}
          </select>
          {label && (
            <label
              onClick={() => innerRef.current?.focus()}
              className={clx(
                "flex items-center mx-3 px-1 absolute transition-all duration-300 origin-0 text-ui-fg-subtle pointer-events-none",
                floated
                  ? "top-3 -translate-y-2 text-xsmall-regular"
                  : "top-3",
                { "left-0": isFocused }
              )}
            >
              {label}
              {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none ">
            <ChevronUpDown />
          </span>
        </div>
      </div>
    )
  }
)

NativeSelect.displayName = "NativeSelect"

export default NativeSelect
