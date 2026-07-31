"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RodiBtn, RodiBtnLink, RodiPill, RodiSectionHead } from "@modules/common/components/rodi"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { RodiIconChevron } from "@modules/common/icons/rodi"
import AddAddress from "@modules/account/components/address-card/add-address"
import type { ZoneProvince } from "@lib/data/zones"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
  zones: ZoneProvince[]
}

const FULFILLMENT_STATUS_STYLE: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  not_fulfilled: { label: "Procesando", bg: "bg-rm-line-2", text: "text-rm-ink-2" },
  partially_fulfilled: { label: "Preparando", bg: "bg-rm-s-butter", text: "text-rm-yellow-deep" },
  fulfilled: { label: "Preparado", bg: "bg-rm-s-butter", text: "text-rm-yellow-deep" },
  partially_shipped: { label: "En camino", bg: "bg-rm-s-pink", text: "text-rm-red" },
  shipped: { label: "En camino", bg: "bg-rm-s-pink", text: "text-rm-red" },
  partially_delivered: { label: "Entregado", bg: "bg-rm-s-mint", text: "text-rm-green" },
  delivered: { label: "Entregado", bg: "bg-rm-s-mint", text: "text-rm-green" },
  canceled: { label: "Cancelado", bg: "bg-rm-line-2", text: "text-rm-ink-2" },
}

const formatOrderDate = (isoDate: string | Date) => {
  const date = new Date(isoDate)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  if (isToday) {
    return "Hoy"
  }
  return date
    .toLocaleDateString("es-CO", { day: "numeric", month: "short" })
    .replace(/\.$/, "")
}

const formatAddressLine = (address: HttpTypes.StoreCustomerAddress) => {
  return [address.city, address.province].filter(Boolean).join(" · ")
}

const Overview = ({ customer, orders, zones }: OverviewProps) => {
  const orderCount = orders?.length ?? 0

  // Real: sum of each order's own discount_total.
  const totalSaved = orders?.reduce((sum, o) => sum + (o.discount_total ?? 0), 0) ?? 0
  const discountedOrderCount =
    orders?.filter((o) => (o.discount_total ?? 0) > 0).length ?? 0
  const savingsCurrency = orders?.[0]?.currency_code ?? "usd"

  // Real: most recent order that isn't delivered/canceled yet. There's no
  // delivery-window/ETA feature in this codebase, so we surface order
  // recency + fulfillment status instead of a fabricated time slot.
  const activeOrder = orders?.find(
    (o) => !["delivered", "canceled"].includes(o.fulfillment_status)
  )
  const activeOrderStatus = activeOrder
    ? FULFILLMENT_STATUS_STYLE[activeOrder.fulfillment_status] ??
      FULFILLMENT_STATUS_STYLE.not_fulfilled
    : null

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
            label: "Ahorrado en ofertas",
            value:
              totalSaved > 0
                ? convertToLocale({ amount: totalSaved, currency_code: savingsCurrency })
                : convertToLocale({ amount: 0, currency_code: savingsCurrency }),
            sub:
              discountedOrderCount > 0
                ? `${discountedOrderCount} ${discountedOrderCount === 1 ? "pedido" : "pedidos"} con descuento`
                : "Aún sin descuentos",
            bg: "bg-rm-s-mint",
            accent: "text-rm-green",
          },
          {
            // Placeholder: no loyalty program exists yet — see
            // [FEATURE/LOYALTY-RODI+] in .context/backlog.md
            label: "Puntos Rodi+",
            value: "1.240",
            sub: "Faltan 260 para Platino",
            bg: "bg-rm-s-butter",
            accent: "text-rm-yellow-deep",
          },
          {
            label: "Próximo pedido",
            value: activeOrder ? formatOrderDate(activeOrder.created_at) : "—",
            sub: activeOrderStatus?.label ?? "Sin pedidos en curso",
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

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-start">
        <section className="bg-rm-paper border border-rm-line rounded-rm-lg p-5">
          <RodiSectionHead
            title="Pedidos recientes"
            actionLabel="Ver todos"
            actionHref="/account/orders"
          />
          <ul className="flex flex-col gap-1" data-testid="orders-wrapper">
            {orders && orders.length > 0 ? (
              orders.slice(0, 4).map((order, i) => {
                const productCount =
                  order.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
                const status =
                  FULFILLMENT_STATUS_STYLE[order.fulfillment_status] ??
                  FULFILLMENT_STATUS_STYLE.not_fulfilled

                return (
                  <li key={order.id} data-testid="order-wrapper">
                    <LocalizedClientLink
                      href={`/account/orders/details/${order.id}`}
                      className={`flex items-center gap-3 py-3 ${
                        i === 0 ? "" : "border-t border-rm-line-2"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-rm-ink" data-testid="order-id">
                          #{order.display_id}
                        </div>
                        <div className="text-xs text-rm-ink-3">
                          {formatOrderDate(order.created_at)} ·{" "}
                          {productCount} {productCount === 1 ? "producto" : "productos"}
                        </div>
                      </div>
                      <RodiPill
                        bgClassName={status.bg}
                        textClassName={status.text}
                        className="w-[92px] shrink-0 justify-center"
                      >
                        {status.label}
                      </RodiPill>
                      <span
                        className="font-display font-extrabold text-rm-ink shrink-0 w-20 text-right tabular-nums"
                        data-testid="order-amount"
                      >
                        {convertToLocale({
                          amount: order.total,
                          currency_code: order.currency_code,
                        })}
                      </span>
                      <span className="w-[30px] h-[30px] rounded-lg border border-rm-line flex items-center justify-center shrink-0">
                        <RodiIconChevron size={12} chevronDirection="right" />
                      </span>
                    </LocalizedClientLink>
                  </li>
                )
              })
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

        <section className="bg-rm-paper border border-rm-line rounded-rm-lg p-[18px] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-extrabold text-rm-ink m-0">
              Direcciones
            </h4>
            <RodiBtnLink href="/account/addresses" kind="ghost" size="sm">
              Editar
            </RodiBtnLink>
          </div>
          {customer?.addresses?.length ? (
            [...customer.addresses]
              .sort((a) => (a.is_default_shipping ? -1 : 1))
              .slice(0, 2)
              .map((address) => (
                <div
                  key={address.id}
                  className="p-3 rounded-rm-md bg-rm-cream"
                  data-testid="address-summary"
                >
                  {(address.is_default_shipping || address.address_name) && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {address.is_default_shipping && (
                        <RodiPill bgClassName="bg-rm-red" textClassName="text-white">
                          Principal
                        </RodiPill>
                      )}
                      {address.address_name && (
                        <span className="text-xs font-semibold text-rm-ink-3">
                          {address.address_name}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-[13px] font-bold text-rm-ink">
                    {address.address_1}
                    {address.address_2 ? `, ${address.address_2}` : ""}
                  </div>
                  <div className="text-xs text-rm-ink-2">
                    {[formatAddressLine(address), address.phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-rm-ink-2" data-testid="no-addresses-message">
              Aún no agregaste direcciones.
            </p>
          )}
          <AddAddress
            zones={zones}
            addresses={customer?.addresses ?? []}
            trigger={({ onClick }) => (
              <RodiBtn kind="ghost" fullWidth size="sm" onClick={onClick}>
                + Agregar dirección
              </RodiBtn>
            )}
          />
        </section>
      </div>
    </div>
  )
}

export default Overview
