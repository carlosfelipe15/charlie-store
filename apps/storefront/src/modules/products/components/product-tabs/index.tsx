"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Información del producto",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Envío y devoluciones",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full bg-rm-paper border border-rm-line rounded-rm-lg px-4">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-sm text-rm-ink-2 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold text-rm-ink">Material</span>
            <p>{product.material ? product.material : "—"}</p>
          </div>
          <div>
            <span className="font-semibold text-rm-ink">Origen</span>
            <p>{product.origin_country ? product.origin_country : "—"}</p>
          </div>
          <div>
            <span className="font-semibold text-rm-ink">Tipo</span>
            <p>{product.type ? product.type.value : "—"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold text-rm-ink">Peso</span>
            <p>{product.weight ? `${product.weight} g` : "—"}</p>
          </div>
          <div>
            <span className="font-semibold text-rm-ink">Dimensiones</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-sm text-rm-ink-2 py-6">
      <div className="grid grid-cols-1 gap-y-6">
        <div className="flex items-start gap-x-3">
          <FastDelivery />
          <div>
            <span className="font-semibold text-rm-ink">Entrega rápida</span>
            <p className="max-w-md mt-1">
              Tu pedido llega en 3–5 días hábiles al punto de retiro o a domicilio.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Refresh />
          <div>
            <span className="font-semibold text-rm-ink">Cambios sencillos</span>
            <p className="max-w-md mt-1">
              Si algo no encaja, te ayudamos a cambiar el producto sin complicaciones.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Back />
          <div>
            <span className="font-semibold text-rm-ink">Devoluciones fáciles</span>
            <p className="max-w-md mt-1">
              Devuelve el producto y reembolsamos tu dinero. Proceso claro y sin letra pequeña.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
