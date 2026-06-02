import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RodiSectionHead } from "@modules/common/components/rodi"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { RodiIconChevron } from "@modules/common/icons/rodi"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const orderCount = orders?.length ?? 0
  const addressCount = customer?.addresses?.length ?? 0
  const profilePct = getProfileCompletion(customer)

  return (
    <div data-testid="overview-page-wrapper" className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Pedidos",
            value: String(orderCount),
            sub: "Historial completo",
            bg: "bg-rm-s-pink",
            accent: "text-rm-red",
          },
          {
            label: "Perfil",
            value: `${profilePct}%`,
            sub: "Completado",
            bg: "bg-rm-s-mint",
            accent: "text-rm-green",
          },
          {
            label: "Direcciones",
            value: String(addressCount),
            sub: "Guardadas",
            bg: "bg-rm-s-butter",
            accent: "text-rm-yellow-deep",
          },
          {
            label: "Cuenta",
            value: "Activa",
            sub: customer?.email ?? "",
            bg: "bg-rm-s-sky",
            accent: "text-rm-blue",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-rm-lg p-4 border border-rm-line/50`}
          >
            <div
              className={`text-[11px] font-extrabold uppercase tracking-wider ${s.accent}`}
            >
              {s.label}
            </div>
            <div className="font-display text-3xl font-extrabold tracking-tight text-rm-ink mt-1.5 leading-none">
              {s.value}
            </div>
            <div className="text-xs text-rm-ink-2 mt-1 line-clamp-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <section className="bg-rm-paper border border-rm-line rounded-rm-lg p-5">
        <RodiSectionHead title="Pedidos recientes" actionHref="/account/orders" />
        <ul className="flex flex-col gap-3" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
              <li key={order.id} data-testid="order-wrapper">
                <LocalizedClientLink
                  href={`/account/orders/details/${order.id}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-rm-lg border border-rm-line hover:border-rm-ink bg-rm-cream/50 transition-colors"
                >
                  <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-sm flex-1 min-w-0">
                    <span className="text-rm-ink-3 text-xs font-semibold">
                      Fecha
                    </span>
                    <span className="text-rm-ink-3 text-xs font-semibold">
                      Pedido
                    </span>
                    <span className="text-rm-ink-3 text-xs font-semibold">
                      Total
                    </span>
                    <span className="font-medium text-rm-ink" data-testid="order-created-date">
                      {new Date(order.created_at).toLocaleDateString("es-CO")}
                    </span>
                    <span className="font-bold text-rm-ink" data-testid="order-id">
                      #{order.display_id}
                    </span>
                    <span className="font-display font-extrabold text-rm-ink" data-testid="order-amount">
                      {convertToLocale({
                        amount: order.total,
                        currency_code: order.currency_code,
                      })}
                    </span>
                  </div>
                  <RodiIconChevron size={14} chevronDirection="right" />
                </LocalizedClientLink>
              </li>
            ))
          ) : (
            <p className="text-sm text-rm-ink-2" data-testid="no-orders-message">
              Aún no tienes pedidos.{" "}
              <LocalizedClientLink href="/store" className="text-rm-red font-bold">
                Ir a la tienda
              </LocalizedClientLink>
            </p>
          )}
        </ul>
      </section>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0
  if (!customer) return 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  if (customer.addresses?.find((addr) => addr.is_default_billing)) count++
  return Math.round((count / 4) * 100)
}

export default Overview
