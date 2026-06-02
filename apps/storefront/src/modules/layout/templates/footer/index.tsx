import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { RodiLogo } from "@modules/common/components/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  const topCategories =
    productCategories?.filter((c) => !c.parent_category).slice(0, 6) ?? []

  return (
    <footer className="w-full bg-rm-ink text-white mt-auto">
      <div className="content-container py-12 small:py-14">
        <div className="grid grid-cols-1 gap-10 small:grid-cols-2 large:grid-cols-5 pb-10 border-b border-white/10">
          <div className="large:col-span-1">
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
          </div>

          {topCategories.length > 0 && (
            <div>
              <p className="text-[13px] font-extrabold mb-3.5">Categorías</p>
              <ul className="space-y-1.5" data-testid="footer-categories">
                {topCategories.map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      className="text-[13px] text-white/65 hover:text-white"
                      data-testid="category-link"
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {collections && collections.length > 0 && (
            <div>
              <p className="text-[13px] font-extrabold mb-3.5">Colecciones</p>
              <ul className="space-y-1.5">
                {collections.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/collections/${c.handle}`}
                      className="text-[13px] text-white/65 hover:text-white"
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-[13px] font-extrabold mb-3.5">Mi cuenta</p>
            <ul className="space-y-1.5">
              {[
                { label: "Ingresar", href: "/account" },
                { label: "Mis pedidos", href: "/account/orders" },
                { label: "Carrito", href: "/cart" },
              ].map((item) => (
                <li key={item.href}>
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

          <div>
            <p className="text-[13px] font-extrabold mb-3.5">Tienda</p>
            <ul className="space-y-1.5">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="text-[13px] text-white/65 hover:text-white"
                >
                  Todos los productos
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/design-system"
                  className="text-[13px] text-white/65 hover:text-white"
                >
                  Design system (dev)
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 small:flex-row small:items-center small:justify-between pt-5 text-xs text-white/45">
          <p>© {new Date().getFullYear()} Rodi Mercado · Charlie Store</p>
          <p className="font-bold text-rm-yellow">🇨🇴 Colombia · COP</p>
        </div>
      </div>
    </footer>
  )
}
