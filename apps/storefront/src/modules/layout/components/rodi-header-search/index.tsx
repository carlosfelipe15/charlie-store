"use client"

import { RodiBtn } from "@modules/common/components/rodi"
import { RodiIconSearch } from "@modules/common/icons/rodi"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

export default function RodiHeaderSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { countryCode } = useParams<{ countryCode: string }>()
  const [query, setQuery] = useState("")

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setQuery(q)
  }, [searchParams])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const base = `/${countryCode}/store`
    const q = query.trim()
    router.push(q ? `${base}?q=${encodeURIComponent(q)}` : base)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-1 items-center h-12 border-[1.5px] border-rm-ink rounded-xl pl-4 pr-1 bg-rm-paper min-w-0"
    >
      <span className="text-rm-ink-3 shrink-0">
        <RodiIconSearch size={18} />
      </span>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca arroz, leche, papel higiénico…"
        className="flex-1 min-w-0 border-0 outline-none bg-transparent px-3 text-sm text-rm-ink placeholder:text-rm-ink-4"
        aria-label="Buscar productos"
      />
      <RodiBtn type="submit" kind="dark" size="sm" className="!h-[38px] !rounded-lg shrink-0">
        Buscar
      </RodiBtn>
    </form>
  )
}
