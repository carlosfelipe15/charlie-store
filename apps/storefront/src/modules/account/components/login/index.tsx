import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import RodiInput from "@modules/common/components/rodi-input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div className="w-full flex flex-col" data-testid="login-page">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-rm-ink m-0">
        Hola de nuevo
      </h1>
      <p className="text-sm text-rm-ink-3 mt-2 mb-6">
        Ingresa con tu correo electrónico
      </p>
      <form className="w-full flex flex-col gap-3" action={formAction}>
        <RodiInput
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          required
          data-testid="email-input"
        />
        <RodiInput
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          data-testid="password-input"
        />
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="mt-2">
          Ingresar
        </SubmitButton>
      </form>
      <p className="text-center text-sm text-rm-ink-3 mt-6">
        ¿Nuevo en Rodi?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="text-rm-red font-bold hover:underline"
          data-testid="register-button"
        >
          Crea tu cuenta gratis →
        </button>
      </p>
    </div>
  )
}

export default Login
