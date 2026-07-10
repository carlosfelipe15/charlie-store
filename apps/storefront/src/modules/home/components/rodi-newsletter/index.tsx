"use client"

import { RodiBtn } from "@modules/common/components/rodi"
import { useToast } from "@modules/common/components/ui"
import { FormEvent, useState } from "react"

/**
 * Newsletter signup (design-reference/ecommerce-test/home.jsx:190-206). No
 * backend endpoint exists for subscriptions yet (ver
 * .context/backlog.md#FEATURE/NEWSLETTER) — el formulario no persiste el
 * email todavía, así que el toast no debe implicar que la suscripción quedó
 * registrada.
 */
export default function RodiNewsletter() {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const { showToast } = useToast()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setPending(true)
    showToast("Gracias por tu interés — la suscripción por email estará disponible pronto.", "info")
    setEmail("")
    setPending(false)
  }

  return (
    <section className="content-container py-10">
      <div className="rounded-rm-xl bg-rm-s-butter p-9 flex flex-col small:flex-row small:items-center small:justify-between gap-6">
        <div>
          <p className="font-display text-[32px] font-extrabold tracking-tight leading-tight text-rm-ink">
            Recibe los descuentos antes que nadie
          </p>
          <p className="text-sm text-rm-ink-2 mt-1.5">
            Solo lo bueno · 1 email a la semana · sin spam
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 bg-rm-paper p-1.5 rounded-rm-md border-[1.5px] border-rm-ink small:min-w-[460px]"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="flex-1 border-0 outline-none h-11 px-3.5 text-sm bg-transparent"
          />
          <RodiBtn type="submit" kind="primary" disabled={pending}>
            Suscribirme
          </RodiBtn>
        </form>
      </div>
    </section>
  )
}
