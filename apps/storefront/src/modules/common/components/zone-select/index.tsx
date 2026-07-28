"use client"

import { clsx } from "clsx"
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react"

import { RodiIconChevron } from "@modules/common/icons/rodi"

export type ZoneOption = { id: string; name: string }

/**
 * Custom dropdown (Headless UI Listbox) used for both Provincia and Municipio,
 * in both the "Entregar en" header picker and the PDP's zone-picker modal.
 * Native <select> can't do what's needed here: a chevron inset from the right
 * edge, rotating up on open, and an options popup that matches the trigger width.
 */
const ZoneSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  testId,
}: {
  value: string
  onChange: (id: string) => void
  options: ZoneOption[]
  placeholder: string
  disabled?: boolean
  testId?: string
}) => {
  const selected = options.find((o) => o.id === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <>
          <ListboxButton
            className={clsx(
              "flex w-full items-center justify-between rounded-rm-md border border-rm-line bg-white",
              // extra right padding so the chevron sits inset from the edge
              "py-2 pl-3 pr-3 text-sm text-left",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-rm-red",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            data-testid={testId}
          >
            <span className={clsx("truncate", selected ? "text-rm-ink" : "text-rm-ink-2")}>
              {selected ? selected.name : placeholder}
            </span>
            <span className="ml-2 shrink-0 text-rm-ink-2">
              <RodiIconChevron size={14} chevronDirection={open ? "up" : "down"} />
            </span>
          </ListboxButton>

          {/* `anchor` makes Headless UI render this in a portal, positioned via
              Floating UI relative to the button — escapes any overflow-hidden/
              overflow-auto ancestor (e.g. the PDP's zone-picker Modal), unlike
              a plain `absolute` panel which used to get clipped by it. */}
          <ListboxOptions
            anchor="bottom start"
            className={clsx(
              "z-[901] max-h-60 w-[var(--button-width)] overflow-auto",
              "rounded-rm-md border border-rm-line bg-white py-1 shadow-lg focus:outline-none",
              "[--anchor-gap:4px]"
            )}
          >
            {options.map((option) => (
              <ListboxOption
                key={option.id}
                value={option.id}
                className={({ focus, selected: isSelected }) =>
                  clsx(
                    "cursor-pointer px-3 py-2 text-sm text-rm-ink",
                    focus && "bg-rm-paper",
                    isSelected && "font-semibold"
                  )
                }
              >
                {option.name}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </>
      )}
    </Listbox>
  )
}

export default ZoneSelect
