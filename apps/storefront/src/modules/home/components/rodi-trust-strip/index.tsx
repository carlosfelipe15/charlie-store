import {
  RodiIconBolt,
  RodiIconLeaf,
  RodiIconShield,
  RodiIconTruck,
} from "@modules/common/icons/rodi"

const items = [
  {
    icon: RodiIconTruck,
    title: "Envío gratis",
    subtitle: "En pedidos seleccionados",
  },
  {
    icon: RodiIconBolt,
    title: "Entrega 90 min",
    subtitle: "En las principales ciudades",
  },
  {
    icon: RodiIconShield,
    title: "Pago seguro",
    subtitle: "Tarjetas, PSE y contraentrega",
  },
  {
    icon: RodiIconLeaf,
    title: "Frescos garantizados",
    subtitle: "O te devolvemos tu dinero",
  },
]

export default function RodiTrustStrip() {
  return (
    <section className="content-container py-6">
      <div className="grid grid-cols-1 small:grid-cols-4 bg-rm-paper border border-rm-line rounded-rm-lg overflow-hidden">
        {items.map(({ icon: Icon, title, subtitle }, i) => (
          <div
            key={title}
            className={`flex items-center gap-3 px-5 py-4 ${
              i < items.length - 1 ? "small:border-r border-rm-line-2" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-rm-s-pink text-rm-red grid place-items-center shrink-0">
              <Icon size={20} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-rm-ink">{title}</div>
              <div className="text-xs text-rm-ink-3">{subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
