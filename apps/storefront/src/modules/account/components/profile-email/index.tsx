import { HttpTypes } from "@medusajs/types"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

// Medusa v2's store customer-update API deliberately omits `email` from the
// updatable fields (`StoreUpdateCustomer` type excludes it) — changing a
// customer's login email isn't exposed on this endpoint. Shown read-only
// with an explanation instead of a form that silently did nothing.
const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  return (
    <div className="w-full" data-testid="account-email-editor">
      <div className="flex items-end justify-between text-small-regular">
        <div className="flex flex-col">
          <span className="uppercase text-[11px] font-extrabold text-rm-ink-3 tracking-wider">
            Correo electrónico
          </span>
          <span className="font-semibold text-rm-ink" data-testid="current-info">
            {customer.email}
          </span>
        </div>
      </div>
      <p className="text-xs text-rm-ink-3 mt-1.5">
        El correo de acceso no se puede cambiar desde aquí por el momento.
        Escríbenos si necesitas actualizarlo.
      </p>
    </div>
  )
}

export default ProfileEmail
