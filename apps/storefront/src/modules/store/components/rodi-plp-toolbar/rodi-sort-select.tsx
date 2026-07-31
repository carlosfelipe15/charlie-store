"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react"
import { clsx } from "clsx"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import {
  RodiIconCheck,
  RodiIconChevron,
  RodiIconSort,
} from "@modules/common/icons/rodi"

const sortLabels: Record<SortOptions, string> = {
  best_selling: "Más vendidos",
  created_at: "Más recientes",
  price_asc: "Menor precio",
  price_desc: "Mayor precio",
}

const sortValues = Object.keys(sortLabels) as SortOptions[]

type RodiSortSelectProps = {
  value: SortOptions
  onChange: (value: SortOptions) => void
}

/**
 * Custom-styled replacement for the native `<select>` this toolbar used to
 * render — a native select's open dropdown is drawn by the OS/browser and
 * can't be themed, so it broke the Rodi look as soon as you opened it. Same
 * `@headlessui/react` Listbox already used by CountrySelect/LanguageSelect,
 * styled with the rm-* tokens instead of their legacy Medusa-starter look.
 */
export default function RodiSortSelect({ value, onChange }: RodiSortSelectProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative">
          <ListboxButton
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rm-line bg-rm-paper text-[13px] font-semibold text-rm-ink hover:bg-rm-line-2/50 transition-colors"
            data-testid="plp-sort"
          >
            <RodiIconSort size={14} />
            {sortLabels[value]}
            <RodiIconChevron size={12} chevronDirection={open ? "up" : "down"} />
          </ListboxButton>
          <ListboxOptions
            anchor={{ to: "bottom end", gap: 6 }}
            transition
            className="z-40 w-[190px] rounded-rm-lg border border-rm-line bg-rm-paper py-1.5 shadow-[0_24px_60px_rgba(26,23,20,0.16)] transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {sortValues.map((option) => (
              <ListboxOption
                key={option}
                value={option}
                className={({ focus, selected }) =>
                  clsx(
                    "flex items-center justify-between gap-2 px-3.5 py-2 text-sm cursor-pointer",
                    focus && "bg-rm-line-2/60",
                    selected ? "font-bold text-rm-red" : "text-rm-ink"
                  )
                }
              >
                {({ selected }) => (
                  <>
                    {sortLabels[option]}
                    {selected && <RodiIconCheck size={13} />}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      )}
    </Listbox>
  )
}
