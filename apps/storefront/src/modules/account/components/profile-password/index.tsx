import { HttpTypes } from "@medusajs/types"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

// Medusa v2's `/auth/:actor_type/:auth_provider/update` route only accepts a
// password-reset token (minted by the "forgot password" flow) — it rejects a
// normal session JWT (verified against @medusajs/medusa's `validateToken`
// middleware, which requires an `entity_id` claim only reset tokens carry).
// There's no "forgot password" flow built in this storefront yet to reuse, so
// self-service password change isn't wired up. Shown as an explicit notice
// instead of a form that silently did nothing (as it did before) or one that
// looks functional but always fails.
const ProfilePassword: React.FC<MyInformationProps> = () => {
  return (
    <div className="w-full" data-testid="account-password-editor">
      <div className="flex items-end justify-between text-small-regular">
        <div className="flex flex-col">
          <span className="uppercase text-[11px] font-extrabold text-rm-ink-3 tracking-wider">
            Contraseña
          </span>
          <span className="font-semibold text-rm-ink" data-testid="current-info">
            La contraseña no se muestra por seguridad
          </span>
        </div>
      </div>
      <p className="text-xs text-rm-ink-3 mt-1.5">
        El cambio de contraseña desde el perfil aún no está disponible.
        Escríbenos si necesitas restablecerla.
      </p>
    </div>
  )
}

export default ProfilePassword
