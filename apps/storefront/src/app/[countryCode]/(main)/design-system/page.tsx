import { Metadata } from "next"

import { rodiColorSwatches, rodiRadii } from "@lib/theme/rodi-tokens"
import {
  convertToLocale,
  formatRodiFromMinorUnits,
  formatRodiMajorUnits,
} from "@lib/util/money"
import {
  RodiBadge,
  RodiBtn,
  RodiLogo,
  RodiPill,
  RodiSectionHead,
  RodiStars,
} from "@modules/common/components/rodi"
import ChevronDown from "@modules/common/icons/chevron-down"
import { RodiIconBolt, RodiIconChevron, rodiIconGallery } from "@modules/common/icons/rodi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Design system — Rodi (Fase 1–2)",
  description: "Tokens, components, icons and money helpers for design review.",
}

const SAMPLE_MINOR = 4870000 // $48.700 COP

export default function DesignSystemPage() {
  return (
    <div className="content-container py-10 pb-20">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-rm-red mb-2">
          Fase 1–2 · Tokens y componentes
        </p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-rm-ink">
          Rodi Mercado — design system
        </h1>
        <p className="mt-3 text-rm-ink-2 max-w-2xl text-sm leading-relaxed">
          Compara esta página con el canvas en{" "}
          <code className="font-mono text-xs bg-rm-line-2 px-1.5 py-0.5 rounded-rm-sm">
            apps/storefront/design-reference
          </code>
          .           Home, footer, nav y cards con Agregar al carrito (variante única) o
          Elegir opciones (varias variantes).
        </p>
        <LocalizedClientLink
          href="/"
          className="inline-block mt-4 text-sm font-bold text-rm-red hover:underline"
        >
          ← Volver a la tienda
        </LocalizedClientLink>
      </div>

      {/* Colors */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-4">
          Colores
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {rodiColorSwatches.map(({ name, cssVar, hex }) => (
            <div
              key={name}
              className="rounded-rm-lg border border-rm-line overflow-hidden bg-rm-paper"
            >
              <div
                className="h-16 w-full"
                style={{ backgroundColor: `var(${cssVar})` }}
              />
              <div className="p-2 text-[10px] font-mono leading-tight">
                <div className="font-bold text-rm-ink">{name}</div>
                <div className="text-rm-ink-3">{hex}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-4">
          Tipografía
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-rm-lg border border-rm-line bg-rm-paper p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rm-ink-3 mb-2">
              font-display · Bricolage Grotesque
            </p>
            <p className="font-display text-3xl font-extrabold tracking-tight">
              Llenamos tu mercado en 90 min.
            </p>
          </div>
          <div className="rounded-rm-lg border border-rm-line bg-rm-paper p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rm-ink-3 mb-2">
              font-sans · Manrope
            </p>
            <p className="text-base leading-relaxed">
              Más de 12.000 productos al precio del barrio. Envío gratis en tu
              primera compra.
            </p>
          </div>
          <div className="rounded-rm-lg border border-rm-line bg-rm-paper p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rm-ink-3 mb-2">
              font-mono · JetBrains Mono
            </p>
            <p className="font-mono text-sm">SKU: PHL-AF-XL6 · #RDM-038124</p>
          </div>
        </div>
      </section>

      {/* Radii */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-4">
          Radios
        </h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(rodiRadii).map(([key, px]) => (
            <div key={key} className="text-center">
              <div
                className="w-20 h-20 bg-rm-s-butter border border-rm-line"
                style={{ borderRadius: px === 999 ? 999 : px }}
              />
              <p className="mt-2 text-xs font-mono text-rm-ink-3">
                {key} · {px}px
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Logo */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-4">
          Logo
        </h2>
        <div className="flex flex-wrap gap-8 items-center">
          <RodiLogo size={22} />
          <div className="bg-rm-ink p-4 rounded-rm-lg">
            <RodiLogo
              size={20}
              markClassName="bg-rm-red text-white"
              textClassName="text-white"
            />
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-4">
          RodiBtn
        </h2>
        <div className="flex flex-wrap gap-3">
          <RodiBtn kind="primary">Primary</RodiBtn>
          <RodiBtn kind="dark">Dark</RodiBtn>
          <RodiBtn kind="yellow">Yellow</RodiBtn>
          <RodiBtn kind="ghost">Ghost</RodiBtn>
          <RodiBtn kind="outline">Outline</RodiBtn>
          <RodiBtn kind="soft">Soft</RodiBtn>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <RodiBtn size="sm">Small</RodiBtn>
          <RodiBtn size="md">Medium</RodiBtn>
          <RodiBtn size="lg">Large</RodiBtn>
        </div>
      </section>

      {/* Badges / pills / stars */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-4">
          Badge, Pill, Stars
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <RodiBadge kind="sale" />
          <RodiBadge kind="new" />
          <RodiBadge kind="fresco" />
          <RodiBadge kind="org" />
          <RodiBadge kind="bolt" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <RodiPill>Oferta del día</RodiPill>
          <RodiPill bgClassName="bg-rm-yellow" textClassName="text-rm-ink">
            <RodiIconBolt size={12} />
            Envío gratis
          </RodiPill>
        </div>
        <RodiStars value={4.7} size={16} />
      </section>

      {/* Section head */}
      <section className="mb-14 rounded-rm-lg border border-rm-line bg-rm-paper p-6">
        <RodiSectionHead
          kicker="Ofertas de la semana"
          title="Lo más buscado al mejor precio"
          actionLabel="Ver todo"
          actionHref="/store"
        />
        <p className="text-sm text-rm-ink-3">
          Usado en product rails de la home.
        </p>
      </section>

      {/* Money */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-4">
          Formato de precio
        </h2>
        <div className="rounded-rm-lg border border-rm-line bg-rm-paper overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rm-line bg-rm-line-2 text-left text-xs font-bold uppercase tracking-wide text-rm-ink-3">
                <th className="p-3">Helper</th>
                <th className="p-3">Ejemplo (48.700 COP)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[13px]">
              <tr className="border-b border-rm-line-2">
                <td className="p-3 text-rm-ink-2">convertToLocale (starter)</td>
                <td className="p-3">
                  {convertToLocale({
                    amount: SAMPLE_MINOR / 100,
                    currency_code: "cop",
                    locale: "en-US",
                  })}
                </td>
              </tr>
              <tr className="border-b border-rm-line-2">
                <td className="p-3 text-rm-ink-2">formatRodiMajorUnits</td>
                <td className="p-3 font-display text-lg font-extrabold text-rm-ink">
                  {formatRodiMajorUnits(48700, "cop")}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-rm-ink-2">formatRodiFromMinorUnits</td>
                <td className="p-3 font-display text-lg font-extrabold text-rm-red">
                  {formatRodiFromMinorUnits(SAMPLE_MINOR, "cop")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-rm-ink-3">
          La tienda sigue usando <code className="font-mono">convertToLocale</code>{" "}
          hasta migrar componentes (Fase 4+).
        </p>
      </section>

      {/* Icons */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-4">
          Iconos Rodi
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3">
          {rodiIconGallery.map(({ name, Icon }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-rm-md border border-rm-line bg-rm-paper p-3 text-rm-ink"
            >
              <Icon size={22} />
              <span className="text-[10px] font-mono text-rm-ink-3">{name}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-rm-lg border border-rm-line bg-rm-s-mint/30 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-rm-ink-3 mb-3">
            Comparación — icono starter (chevron)
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <ChevronDown size={22} />
              <span className="text-xs text-rm-ink-2">chevron-down (actual)</span>
            </div>
            <div className="flex items-center gap-2 text-rm-red">
              <RodiIconChevron size={22} />
              <span className="text-xs text-rm-ink-2">chevron (Rodi)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Surfaces */}
      <section>
        <h2 className="font-display text-2xl font-extrabold tracking-tight mb-4">
          Superficies de categoría
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {(
            [
              ["s-pink", "bg-rm-s-pink", "🥬"],
              ["s-peach", "bg-rm-s-peach", "🍝"],
              ["s-butter", "bg-rm-s-butter", "📦"],
              ["s-mint", "bg-rm-s-mint", "🥛"],
              ["s-sky", "bg-rm-s-sky", "🥤"],
              ["s-lilac", "bg-rm-s-lilac", "🧴"],
              ["s-sand", "bg-rm-s-sand", "☕"],
            ] as const
          ).map(([name, cls, emoji]) => (
            <div
              key={name}
              className={`${cls} rounded-rm-lg p-4 h-28 flex flex-col justify-between border border-rm-line/50`}
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-[10px] font-mono font-bold text-rm-ink-3">
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
