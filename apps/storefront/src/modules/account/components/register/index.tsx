"use client"

import { useActionState } from "react"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RodiInput from "@modules/common/components/rodi-input"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(
    signup as (
      state: string | null,
      formData: FormData
    ) => Promise<string | null>,
    null as string | null
  )

  return (
    <div className="w-full flex flex-col" data-testid="register-page">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-rm-ink m-0">
        Crea tu cuenta
      </h1>
      <p className="text-sm text-rm-ink-3 mt-2 mb-6">
        Accede a ofertas, pedidos y listas guardadas
      </p>
      <form className="w-full flex flex-col gap-3" action={formAction}>
        <div className="grid grid-cols-2 gap-3">
          <RodiInput
            label="Nombre"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <RodiInput
            label="Apellido"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
        </div>
        <RodiInput
          label="Correo"
          name="email"
          required
          type="email"
          autoComplete="email"
          data-testid="email-input"
        />
        <RodiInput
          label="Teléfono"
          name="phone"
          type="tel"
          autoComplete="tel"
          data-testid="phone-input"
        />
        <RodiInput
          label="Contraseña"
          name="password"
          required
          type="password"
          autoComplete="new-password"
          data-testid="password-input"
        />
        <ErrorMessage error={message} data-testid="register-error" />
        <p className="text-xs text-rm-ink-3 leading-relaxed">
          Al registrarte aceptas la{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="text-rm-red font-semibold hover:underline"
          >
            política de privacidad
          </LocalizedClientLink>{" "}
          y los{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="text-rm-red font-semibold hover:underline"
          >
            términos de uso
          </LocalizedClientLink>
          .
        </p>
        <SubmitButton data-testid="register-button" className="mt-1">
          Crear cuenta
        </SubmitButton>
      </form>
      <p className="text-center text-sm text-rm-ink-3 mt-6">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="text-rm-red font-bold hover:underline"
        >
          Ingresar
        </button>
      </p>
    </div>
  )
}

export default Register
