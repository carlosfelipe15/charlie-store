import { RodiBtnLink } from "@modules/common/components/rodi"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-20 px-2 flex flex-col items-center text-center max-w-md mx-auto"
      data-testid="empty-cart-message"
    >
      <span className="text-6xl mb-4" aria-hidden>
        🛒
      </span>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-rm-ink m-0">
        Tu carrito está vacío
      </h1>
      <p className="text-sm text-rm-ink-2 mt-3 mb-6 leading-relaxed">
        Aún no has agregado productos. Explora el catálogo y llena tu mercado en
        minutos.
      </p>
      <RodiBtnLink href="/store" kind="primary" size="lg">
        Empezar a comprar
      </RodiBtnLink>
    </div>
  )
}

export default EmptyCartMessage
