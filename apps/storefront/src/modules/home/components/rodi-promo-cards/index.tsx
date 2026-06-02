import { RodiPill } from "@modules/common/components/rodi"
import { RodiIconLeaf } from "@modules/common/icons/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function RodiHomePromoCards() {
  return (
    <div className="grid grid-rows-2 gap-4 h-full min-h-[280px] small:min-h-0">
      <LocalizedClientLink
        href="/store"
        className="relative overflow-hidden rounded-[18px] bg-rm-s-butter p-6 flex flex-col justify-end hover:shadow-md transition-shadow"
      >
        <RodiPill bgClassName="bg-rm-yellow" textClassName="text-rm-ink" className="w-fit">
          NUEVO
        </RodiPill>
        <p className="font-display text-2xl font-extrabold tracking-tight text-rm-ink leading-tight mt-3 m-0">
          Marcas propias
          <br />
          <span className="text-rm-red">Rodi</span>
        </p>
        <p className="text-[13px] text-rm-ink-2 mt-1.5">Hasta 30% más económico</p>
        <span className="absolute right-3 bottom-1 text-7xl pointer-events-none" aria-hidden>
          📦
        </span>
      </LocalizedClientLink>
      <LocalizedClientLink
        href="/store"
        className="relative overflow-hidden rounded-[18px] bg-rm-s-mint p-6 flex flex-col justify-end hover:shadow-md transition-shadow"
      >
        <RodiPill bgClassName="bg-rm-green" textClassName="text-white" className="w-fit">
          <RodiIconLeaf size={12} />
          Orgánicos
        </RodiPill>
        <p className="font-display text-2xl font-extrabold tracking-tight text-rm-ink leading-tight mt-3 m-0">
          Frutas y
          <br />
          verduras frescas
        </p>
        <p className="text-[13px] text-rm-ink-2 mt-1.5">Del campo a tu casa, en 24 h</p>
        <span className="absolute right-3 bottom-1 text-7xl pointer-events-none" aria-hidden>
          🥬
        </span>
      </LocalizedClientLink>
    </div>
  )
}
