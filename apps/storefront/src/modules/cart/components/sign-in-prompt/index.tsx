import { RodiBtnLink } from "@modules/common/components/rodi"

const SignInPrompt = () => {
  return (
    <div className="bg-rm-s-butter border border-rm-line rounded-rm-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-extrabold text-rm-ink m-0">
          ¿Ya tienes cuenta?
        </p>
        <p className="text-xs text-rm-ink-2 mt-0.5">
          Inicia sesión para guardar tu carrito y ver pedidos anteriores.
        </p>
      </div>
      <RodiBtnLink href="/account" kind="outline" size="sm" data-testid="sign-in-button">
        Iniciar sesión
      </RodiBtnLink>
    </div>
  )
}

export default SignInPrompt
