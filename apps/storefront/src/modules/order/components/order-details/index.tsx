import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const FULFILLMENT_STATUS_LABEL: Record<string, string> = {
  not_fulfilled: "Sin preparar",
  partially_fulfilled: "Parcialmente preparado",
  fulfilled: "Preparado",
  partially_shipped: "Parcialmente enviado",
  shipped: "Enviado",
  partially_delivered: "Parcialmente entregado",
  delivered: "Entregado",
  canceled: "Cancelado",
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  not_paid: "Sin pagar",
  awaiting: "Pendiente",
  captured: "Pagado",
  partially_captured: "Pago parcial",
  partially_refunded: "Parcialmente reembolsado",
  refunded: "Reembolsado",
  canceled: "Cancelado",
  requires_action: "Requiere acción",
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string, labels: Record<string, string>) => {
    if (labels[str]) {
      return labels[str]
    }
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div>
      <Text>
        Hemos enviado los detalles de confirmación del pedido a{" "}
        <span
          className="text-rm-ink font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Fecha del pedido:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </Text>
      <Text className="mt-2 text-rm-red font-semibold">
        Número de pedido: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Estado del pedido:{" "}
              <span className="text-rm-ink-2" data-testid="order-status">
                {formatStatus(order.fulfillment_status, FULFILLMENT_STATUS_LABEL)}
              </span>
            </Text>
            <Text>
              Estado del pago:{" "}
              <span
                className="text-rm-ink-2"
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status, PAYMENT_STATUS_LABEL)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
