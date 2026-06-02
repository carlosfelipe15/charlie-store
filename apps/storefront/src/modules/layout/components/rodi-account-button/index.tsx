import { retrieveCustomer } from "@lib/data/customer"
import { RodiIconUser } from "@modules/common/icons/rodi"
import { RodiHeaderAction } from "@modules/layout/components/rodi-header-action"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function RodiAccountButton() {
  const customer = await retrieveCustomer().catch(() => null)

  const sub = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      "Mi cuenta"
    : "Ingresar"

  return (
    <LocalizedClientLink
      href="/account"
      data-testid="nav-account-link"
      className="hidden small:block"
    >
      <RodiHeaderAction
        icon={<RodiIconUser size={20} />}
        label="Cuenta"
        sub={sub}
      />
    </LocalizedClientLink>
  )
}
