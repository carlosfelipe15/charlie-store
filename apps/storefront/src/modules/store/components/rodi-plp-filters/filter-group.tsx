"use client"

import { clsx } from "clsx"
import { useState } from "react"

import { RodiIconChevron } from "@modules/common/icons/rodi"

type RodiFilterGroupProps = {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  last?: boolean
}

/** Collapsible filter section — matches design-reference `FilterGroup` (pages.jsx). */
export default function RodiFilterGroup({
  title,
  children,
  defaultOpen = true,
  last = false,
}: RodiFilterGroupProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={clsx("mt-5 pt-4", !last && "border-t border-rm-line-2")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wide text-rm-ink-3 mb-2.5"
        aria-expanded={open}
      >
        {title}
        <RodiIconChevron size={12} chevronDirection={open ? "up" : "down"} />
      </button>
      {open && children}
    </div>
  )
}
