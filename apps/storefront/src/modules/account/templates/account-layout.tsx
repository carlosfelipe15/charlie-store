import RodiBreadcrumbs from "@modules/products/components/rodi-breadcrumbs"
import RodiAccountNav from "@modules/account/components/rodi-account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout = ({ customer, children }: AccountLayoutProps) => {
  const name = customer?.first_name ?? "Cliente"

  if (!customer) {
    return (
      <div className="py-6 content-container" data-testid="account-page">
        {children}
      </div>
    )
  }

  return (
    <div className="py-8 content-container" data-testid="account-page">
      <RodiBreadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Mi cuenta" },
        ]}
      />
      <header className="mt-2 mb-8">
        <h1 className="font-display text-3xl small:text-4xl font-extrabold tracking-tight text-rm-ink m-0">
          Hola, {name} 👋
        </h1>
        <p className="text-sm text-rm-ink-2 mt-2">
          Sesión:{" "}
          <span className="font-semibold text-rm-ink" data-testid="customer-email">
            {customer.email}
          </span>
        </p>
      </header>
      <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] gap-6 small:gap-8">
        <div className="small:sticky small:top-36 small:self-start">
          <RodiAccountNav customer={customer} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}

export default AccountLayout
