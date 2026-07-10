import { listRegions } from "@lib/data/regions"
import { RodiLogo } from "@modules/common/components/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RegionBadge from "@modules/layout/components/region-badge"

const FOOTER_COLUMNS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "Comprar",
    items: [
      { label: "Todas las categorías", href: "/store" },
      { label: "Ofertas del día", href: "/offers" },
      { label: "Marcas propias", href: "/brands" },
      { label: "Recetas", href: "/recipes" },
      { label: "Nuevos productos", href: "/store?sortBy=created_at" },
    ],
  },
  {
    title: "Mi cuenta",
    items: [
      { label: "Ingresar", href: "/account" },
      { label: "Crear cuenta", href: "/account" },
      { label: "Mis pedidos", href: "/account/orders" },
      { label: "Direcciones", href: "/account/addresses" },
      { label: "Favoritos", href: "/account/favorites" },
    ],
  },
  {
    title: "Ayuda",
    items: [
      { label: "Centro de ayuda", href: "/help" },
      { label: "Devoluciones", href: "/returns" },
      { label: "Estado del pedido", href: "/account/orders" },
      { label: "Métodos de pago", href: "/content/payment-methods" },
      { label: "Contáctanos", href: "/contact" },
    ],
  },
  {
    title: "Rodi Mercado",
    items: [
      { label: "Sobre nosotros", href: "/about" },
      { label: "Trabaja con nosotros", href: "/careers" },
      { label: "Vender en Rodi", href: "/sell" },
      { label: "Sostenibilidad", href: "/sustainability" },
      { label: "Prensa", href: "/press" },
    ],
  },
]

const LEGAL_LINKS = [
  { label: "Términos", href: "/content/terms-of-use" },
  { label: "Privacidad", href: "/content/privacy-policy" },
  { label: "Cookies", href: "/content/cookies-policy" },
]

function PaymentBadges() {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <div className="w-11 h-7 rounded-[5px] bg-white shadow-sm grid place-items-center">
        <span className="italic font-extrabold text-[13px] tracking-tight text-[#1A1F71]">
          VISA
        </span>
      </div>
      <div className="w-11 h-7 rounded-[5px] bg-white shadow-sm grid place-items-center">
        <div className="flex items-center">
          <div className="w-[15px] h-[15px] rounded-full bg-[#EB001B]" />
          <div className="w-[15px] h-[15px] rounded-full bg-[#F79E1B] -ml-1.5 mix-blend-multiply" />
        </div>
      </div>
      <div className="w-11 h-7 rounded-[5px] bg-white shadow-sm flex items-center justify-center gap-[3px]">
        <span className="font-display font-extrabold text-[8.5px] tracking-tight text-[#1A1A1A]">
          DISC
        </span>
        <div className="w-[7px] h-[7px] rounded-full bg-[#F76B1C]" />
        <span className="font-display font-extrabold text-[8.5px] tracking-tight text-[#1A1A1A]">
          VER
        </span>
      </div>
    </div>
  )
}

export default async function Footer() {
  const regions = await listRegions().catch(() => null)

  return (
    <footer className="w-full bg-rm-ink text-white mt-auto">
      <div className="content-container py-12 small:py-14">
        <div className="grid grid-cols-1 gap-10 small:grid-cols-2 large:grid-cols-5 pb-8 border-b border-white/10">
          <div>
            <LocalizedClientLink href="/" className="inline-block">
              <RodiLogo
                size={20}
                markClassName="bg-rm-red text-white"
                textClassName="text-white"
              />
            </LocalizedClientLink>
            <p className="mt-3.5 text-[13px] leading-relaxed text-white/65 max-w-[280px]">
              Mercado online de Latinoamérica. Frescos, despensa, hogar y más.
              Entregamos en menos de 90 minutos.
            </p>
            <PaymentBadges />
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-extrabold mb-3.5">{col.title}</p>
              <ul className="space-y-1.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <LocalizedClientLink
                      href={item.href}
                      className="text-[13px] text-white/65 hover:text-white"
                    >
                      {item.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 small:flex-row small:items-center small:justify-between pt-5 text-xs text-white/45">
          <p>© {new Date().getFullYear()} Rodi Mercado · Charlie Store</p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.href}
                href={link.href}
                className="hover:text-white"
              >
                {link.label}
              </LocalizedClientLink>
            ))}
            <RegionBadge
              regions={regions}
              className="font-bold text-rm-yellow"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
