import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Ingresa a tu cuenta de Rodi Mercado.",
}

export default function Login() {
  return <LoginTemplate />
}
