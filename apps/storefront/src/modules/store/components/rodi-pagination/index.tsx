"use client"

import React from "react"
import { RodiIconChevron } from "@modules/common/icons/rodi"
import { clsx } from "clsx"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function RodiPagination({
  page,
  totalPages,
  "data-testid": dataTestid,
}: {
  page: number
  totalPages: number
  "data-testid"?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const pageBtnClass = (active: boolean) =>
    clsx(
      "w-9 h-9 rounded-lg text-[13px] font-bold font-sans transition-colors",
      active
        ? "bg-rm-ink text-white border-0"
        : "bg-rm-paper text-rm-ink border border-rm-line hover:bg-rm-line-2"
    )

  const renderPageButtons = () => {
    const buttons: React.ReactNode[] = []

    if (totalPages <= 7) {
      arrayRange(1, totalPages).forEach((p) =>
        buttons.push(
          <button
            key={p}
            type="button"
            className={pageBtnClass(p === page)}
            disabled={p === page}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </button>
        )
      )
    } else if (page <= 4) {
      arrayRange(1, 5).forEach((p) =>
        buttons.push(
          <button
            key={p}
            type="button"
            className={pageBtnClass(p === page)}
            disabled={p === page}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </button>
        )
      )
      buttons.push(
        <span key="e1" className="px-1 text-rm-ink-3">
          …
        </span>
      )
      buttons.push(
        <button
          key={totalPages}
          type="button"
          className={pageBtnClass(totalPages === page)}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      )
    } else if (page >= totalPages - 3) {
      buttons.push(
        <button
          key={1}
          type="button"
          className={pageBtnClass(1 === page)}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      )
      buttons.push(<span key="e2" className="px-1 text-rm-ink-3">…</span>)
      arrayRange(totalPages - 4, totalPages).forEach((p) =>
        buttons.push(
          <button
            key={p}
            type="button"
            className={pageBtnClass(p === page)}
            disabled={p === page}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </button>
        )
      )
    } else {
      buttons.push(
        <button
          key={1}
          type="button"
          className={pageBtnClass(1 === page)}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      )
      buttons.push(<span key="e3" className="px-1 text-rm-ink-3">…</span>)
      arrayRange(page - 1, page + 1).forEach((p) =>
        buttons.push(
          <button
            key={p}
            type="button"
            className={pageBtnClass(p === page)}
            disabled={p === page}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </button>
        )
      )
      buttons.push(<span key="e4" className="px-1 text-rm-ink-3">…</span>)
      buttons.push(
        <button
          key={totalPages}
          type="button"
          className={pageBtnClass(totalPages === page)}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      )
    }

    return buttons
  }

  if (totalPages <= 1) return null

  return (
    <div
      className="flex items-center justify-center gap-1.5 mt-10"
      data-testid={dataTestid}
    >
      <button
        type="button"
        className={pageBtnClass(false)}
        disabled={page <= 1}
        onClick={() => handlePageChange(page - 1)}
        aria-label="Página anterior"
      >
        <RodiIconChevron size={14} chevronDirection="left" />
      </button>
      {renderPageButtons()}
      <button
        type="button"
        className={pageBtnClass(false)}
        disabled={page >= totalPages}
        onClick={() => handlePageChange(page + 1)}
        aria-label="Página siguiente"
      >
        <RodiIconChevron size={14} chevronDirection="right" />
      </button>
    </div>
  )
}
