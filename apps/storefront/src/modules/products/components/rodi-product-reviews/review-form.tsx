"use client"

import { createProductReview } from "@lib/data/reviews"
import { RodiBtn } from "@modules/common/components/rodi"
import { RodiIconStar } from "@modules/common/icons/rodi"
import { useToast } from "@modules/common/components/ui"
import { clsx } from "clsx"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

export default function RodiReviewForm({
  productId,
  isLoggedIn,
}: {
  productId: string
  isLoggedIn: boolean
}) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [pending, setPending] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-rm-ink-2">
        Inicia sesión para dejar una reseña de este producto.
      </p>
    )
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return

    setPending(true)
    const result = await createProductReview({
      productId,
      rating,
      title: title.trim() || undefined,
      body: body.trim(),
    })
    setPending(false)

    if (result.success) {
      showToast("¡Gracias por tu reseña!", "success")
      setTitle("")
      setBody("")
      setRating(5)
      router.refresh()
    } else {
      showToast(result.error || "No se pudo publicar la reseña.", "error")
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} de 5 estrellas`}
            aria-pressed={rating === n}
            className="p-0.5"
          >
            <RodiIconStar
              size={20}
              filled={n <= rating}
              className={clsx(
                n <= rating ? "text-rm-yellow-deep" : "text-rm-line"
              )}
            />
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (opcional)"
        className="h-[42px] px-3 border-[1.5px] border-rm-line rounded-lg text-sm outline-none focus:border-rm-ink bg-rm-paper"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Cuéntanos qué te pareció el producto"
        required
        rows={3}
        className="px-3 py-2 border-[1.5px] border-rm-line rounded-lg text-sm outline-none focus:border-rm-ink bg-rm-paper resize-none"
      />
      <RodiBtn type="submit" kind="dark" size="md" disabled={pending} className="w-fit">
        {pending ? "Publicando…" : "Publicar reseña"}
      </RodiBtn>
    </form>
  )
}
