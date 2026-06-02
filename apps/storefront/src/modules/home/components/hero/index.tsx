import { RodiIconBolt } from "@modules/common/icons/rodi"
import { RodiBtnLink, RodiPill } from "@modules/common/components/rodi"

const Hero = () => {
  return (
    <section className="h-full">
      <div className="relative overflow-hidden rounded-[18px] bg-rm-red text-white min-h-[280px] small:min-h-[320px] h-full flex items-center px-8 small:px-10 py-10">
        <div className="relative z-10 max-w-lg">
          <RodiPill
            bgClassName="bg-white/20"
            textClassName="text-white"
            className="mb-3.5 normal-case tracking-normal"
          >
            <RodiIconBolt size={12} />
            Hasta 40% OFF
          </RodiPill>
          <h1 className="font-display text-4xl small:text-5xl font-extrabold tracking-tight leading-[0.95] m-0">
            Llenamos
            <br />
            tu mercado
            <br />
            en 90 min.
          </h1>
          <p className="mt-3.5 text-base leading-relaxed opacity-90 max-w-md">
            Productos frescos y de despensa con entrega rápida. Empieza tu pedido
            en unos clics.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-5">
            <RodiBtnLink href="/store" kind="yellow" size="lg">
              Empezar a comprar
            </RodiBtnLink>
            <RodiBtnLink
              href="/store"
              kind="ghost"
              size="lg"
              className="!border-white/30 !text-white hover:!bg-white/10"
            >
              Ver ofertas
            </RodiBtnLink>
          </div>
        </div>
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/2 opacity-90 hidden small:block"
          aria-hidden
        >
          <span className="absolute right-8 top-10 text-[140px] leading-none -rotate-12">
            🛒
          </span>
          <span className="absolute right-48 top-52 text-6xl rotate-[18deg]">
            🥑
          </span>
          <span className="absolute right-16 top-60 text-5xl -rotate-[8deg]">
            🍅
          </span>
        </div>
      </div>
    </section>
  )
}

export default Hero
