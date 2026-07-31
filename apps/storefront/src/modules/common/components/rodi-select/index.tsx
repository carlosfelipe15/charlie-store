"use client"

import { Listbox, Transition } from "@headlessui/react"
import { clsx } from "clsx"
import { Fragment } from "react"

import { RodiIconChevron } from "@modules/common/icons/rodi"

export type RodiSelectOption = { value: string; label: string }

type RodiSelectProps = {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  options: RodiSelectOption[]
  disabled?: boolean
  /** Included in the surrounding <form>'s FormData via a hidden input. */
  name?: string
  "data-testid"?: string
}

const RodiSelect = ({
  placeholder = "Selecciona...",
  value,
  onChange,
  options,
  disabled,
  name,
  "data-testid": dataTestid,
}: RodiSelectProps) => {
  const selected = options.find((o) => o.value === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        {name && <input type="hidden" name={name} value={value} />}
        <Listbox.Button
          data-testid={dataTestid}
          className={clsx(
            "relative w-full h-[42px] flex items-center justify-between gap-2 bg-rm-paper border-[1.5px] border-rm-line rounded-lg px-3 text-sm text-left transition-colors",
            "focus:outline-none focus-visible:border-rm-ink",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-rm-ink"
          )}
        >
          <span className={clsx("truncate", !selected && "text-rm-ink-4")}>
            {selected ? selected.label : placeholder}
          </span>
          <RodiIconChevron size={14} className="text-rm-ink-3 shrink-0" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* `anchor` portals the panel out of the modal's scroll container
              (which clips absolutely-positioned children via overflow) and
              positions it with floating-ui instead. `--button-width` is set
              by Headless UI on the anchored panel to match the trigger. */}
          <Listbox.Options
            anchor={{ to: "bottom start", gap: 6 }}
            className="z-50 w-[var(--button-width)] max-h-60 overflow-auto bg-rm-paper border border-rm-line rounded-lg shadow-lg py-1 focus:outline-none"
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active, selected }) =>
                  clsx(
                    "px-3 py-2 text-sm cursor-pointer transition-colors",
                    active && "bg-rm-line-2",
                    selected ? "font-bold text-rm-red" : "text-rm-ink"
                  )
                }
              >
                {option.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

export default RodiSelect
