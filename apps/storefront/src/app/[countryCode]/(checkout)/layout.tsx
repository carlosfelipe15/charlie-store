import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RodiLogo } from "@modules/common/components/rodi"
import { RodiIconChevron, RodiIconShield } from "@modules/common/icons/rodi"
import RodiCheckoutStepper from "@modules/checkout/components/rodi-checkout-stepper"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-rm-cream text-rm-ink relative min-h-screen">
      <header className="bg-rm-paper border-b border-rm-line">
        <nav className="flex h-14 small:h-16 items-center content-container justify-between gap-4">
          <LocalizedClientLink
            href="/cart"
            className="flex items-center gap-2 text-sm font-semibold text-rm-ink-2 hover:text-rm-ink shrink-0"
            data-testid="back-to-cart-link"
          >
            <RodiIconChevron size={14} chevronDirection="left" />
            <span className="hidden small:inline">Volver al carrito</span>
            <span className="small:hidden">Volver</span>
          </LocalizedClientLink>
          <LocalizedClientLink href="/" data-testid="store-link" className="shrink-0">
            <RodiLogo size={20} />
          </LocalizedClientLink>
          <div className="hidden md:flex items-center gap-5 text-[13px] shrink-0">
            <span className="inline-flex items-center gap-1.5 text-rm-green font-bold">
              <RodiIconShield size={16} />
              Compra 100% segura
            </span>
            <span className="text-rm-ink-3">
              ¿Ayuda?{" "}
              <strong className="text-rm-ink">+57 300 123 4567</strong>
            </span>
          </div>
        </nav>
      </header>
      <Suspense fallback={null}>
        <RodiCheckoutStepper />
      </Suspense>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
