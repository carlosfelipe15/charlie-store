import { Metadata } from "next"
import { notFound } from "next/navigation"

type ContentDoc = {
  title: string
  updatedAt: string
  intro: string
  sections: { heading: string; body: string[] }[]
}

// Static legal/informational content. Placeholder copy — reemplazar con el texto
// legal definitivo antes de producción. Vive en el front porque no requiere datos
// del backend.
const CONTENT: Record<string, ContentDoc> = {
  "privacy-policy": {
    title: "Política de privacidad",
    updatedAt: "julio de 2026",
    intro:
      "En Rodi Mercado nos tomamos en serio la protección de tus datos personales. Esta política describe qué información recopilamos, cómo la usamos y qué derechos tienes sobre ella.",
    sections: [
      {
        heading: "Información que recopilamos",
        body: [
          "Datos de contacto y de entrega que nos proporcionas al crear una cuenta o realizar un pedido (nombre, dirección, correo electrónico y teléfono).",
          "Información de tus pedidos y preferencias de compra para ofrecerte un mejor servicio.",
        ],
      },
      {
        heading: "Cómo usamos tu información",
        body: [
          "Procesar y entregar tus pedidos, y mantenerte informado sobre su estado.",
          "Mejorar nuestro catálogo y tu experiencia de compra. No vendemos tus datos a terceros.",
        ],
      },
      {
        heading: "Tus derechos",
        body: [
          "Puedes acceder, corregir o eliminar tus datos personales en cualquier momento desde tu cuenta o escribiéndonos a través de la página de contacto.",
        ],
      },
    ],
  },
  "terms-of-use": {
    title: "Términos de uso",
    updatedAt: "julio de 2026",
    intro:
      "Estos términos regulan el uso de la tienda en línea de Rodi Mercado. Al usar el sitio y realizar compras aceptas las condiciones descritas a continuación.",
    sections: [
      {
        heading: "Uso del sitio",
        body: [
          "Te comprometes a proporcionar información veraz al crear tu cuenta y realizar pedidos.",
          "Los precios y la disponibilidad de los productos pueden cambiar sin previo aviso.",
        ],
      },
      {
        heading: "Pedidos y pagos",
        body: [
          "La confirmación de un pedido está sujeta a la validación del pago y a la disponibilidad de inventario.",
          "Nos reservamos el derecho de cancelar pedidos ante errores de precio evidentes o sospecha de fraude.",
        ],
      },
      {
        heading: "Contacto",
        body: [
          "Si tienes preguntas sobre estos términos, escríbenos a través de nuestra página de contacto.",
        ],
      },
    ],
  },
}

type Props = {
  params: Promise<{ slug: string; countryCode: string }>
}

export async function generateStaticParams() {
  return Object.keys(CONTENT).map((slug) => ({ slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const doc = CONTENT[slug]
  if (!doc) {
    return { title: "Contenido no encontrado" }
  }
  return {
    title: `${doc.title} — Rodi Mercado`,
    description: doc.intro,
  }
}

export default async function ContentPage(props: Props) {
  const { slug } = await props.params
  const doc = CONTENT[slug]

  if (!doc) {
    notFound()
  }

  return (
    <div className="content-container py-10 pb-20 max-w-3xl">
      <h1 className="font-display text-3xl text-rm-ink">{doc.title}</h1>
      <p className="text-sm text-rm-ink-3 mt-1">
        Última actualización: {doc.updatedAt}
      </p>
      <p className="text-rm-ink-2 mt-6 leading-relaxed">{doc.intro}</p>

      <div className="mt-8 flex flex-col gap-8">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-semibold text-lg text-rm-ink">
              {section.heading}
            </h2>
            <div className="mt-2 flex flex-col gap-2">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-rm-ink-2 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
