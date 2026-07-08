import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contacto y ayuda — Rodi Mercado",
  description:
    "¿Necesitas ayuda con tu pedido, una devolución o un cambio? Contáctanos.",
}

export default function ContactPage() {
  return (
    <div className="content-container py-10 pb-20 max-w-3xl">
      <h1 className="font-display text-3xl text-rm-ink">Contacto y ayuda</h1>
      <p className="text-rm-ink-2 mt-6 leading-relaxed">
        Estamos para ayudarte. Escríbenos y te responderemos lo antes posible.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-rm-lg border-[1.5px] border-rm-line bg-rm-paper p-5">
          <h2 className="font-semibold text-rm-ink">Atención al cliente</h2>
          <p className="text-sm text-rm-ink-2 mt-2">
            Correo:{" "}
            <a
              href="mailto:ayuda@rodimercado.com"
              className="text-rm-red font-semibold hover:underline"
            >
              ayuda@rodimercado.com
            </a>
          </p>
          <p className="text-sm text-rm-ink-2 mt-1">
            Horario: lunes a sábado, 8:00 a.m. – 8:00 p.m.
          </p>
        </div>

        <div
          id="devoluciones"
          className="rounded-rm-lg border-[1.5px] border-rm-line bg-rm-paper p-5"
        >
          <h2 className="font-semibold text-rm-ink">
            Devoluciones y cambios
          </h2>
          <p className="text-sm text-rm-ink-2 mt-2">
            Si tu pedido llegó incompleto o algún producto no está en buen
            estado, escríbenos dentro de las 48 horas posteriores a la entrega y
            gestionamos el cambio o la devolución sin costo.
          </p>
        </div>
      </div>
    </div>
  )
}
