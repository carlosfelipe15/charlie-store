import { Metadata } from "next"

import { getSiteReviewSummary } from "@lib/data/reviews"
import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Ingresa a tu cuenta de Rodi Mercado.",
}

export default async function Login() {
  const reviewSummary = await getSiteReviewSummary()
  return <LoginTemplate reviewSummary={reviewSummary} />
}
