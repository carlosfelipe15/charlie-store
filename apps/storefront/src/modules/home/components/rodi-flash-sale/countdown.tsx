"use client"

import { useEffect, useState } from "react"

function getRemaining() {
  const now = new Date()
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)
  const diffMs = Math.max(0, endOfDay.getTime() - now.getTime())

  const hrs = Math.floor(diffMs / 3_600_000)
  const min = Math.floor((diffMs % 3_600_000) / 60_000)
  const sec = Math.floor((diffMs % 60_000) / 1_000)

  return {
    hrs: String(hrs).padStart(2, "0"),
    min: String(min).padStart(2, "0"),
    sec: String(sec).padStart(2, "0"),
  }
}

/** Ticks down to midnight local time — "solo hoy" flash sale framing. */
export default function FlashSaleCountdown() {
  const [remaining, setRemaining] = useState<ReturnType<
    typeof getRemaining
  > | null>(null)

  useEffect(() => {
    setRemaining(getRemaining())
    const id = setInterval(() => setRemaining(getRemaining()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!remaining) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {[
        [remaining.hrs, "HRS"],
        [remaining.min, "MIN"],
        [remaining.sec, "SEG"],
      ].map(([value, label]) => (
        <div key={label} className="text-center min-w-[52px]">
          <div className="font-display text-2xl font-extrabold tracking-tight bg-white/10 rounded-lg py-1">
            {value}
          </div>
          <div className="text-[10px] text-white/60 mt-1 tracking-widest">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
