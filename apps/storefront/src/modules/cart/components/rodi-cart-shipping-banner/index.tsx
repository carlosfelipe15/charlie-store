import { RodiIconTruck } from "@modules/common/icons/rodi"

/** Mensaje estático de envío gratis; se puede conectar a promos Medusa después. */
export default function RodiCartShippingBanner() {
  return (
    <div className="bg-rm-s-mint text-rm-green rounded-rm-lg px-4 py-3.5 flex items-center gap-3 mb-3.5">
      <RodiIconTruck size={20} />
      <div className="flex-1 text-sm font-semibold">
        <strong>¡Envío gratis en pedidos seleccionados!</strong>
        <div className="h-1.5 bg-rm-green/20 rounded-full mt-2 overflow-hidden">
          <div className="h-full w-[62%] bg-rm-green rounded-full" />
        </div>
      </div>
    </div>
  )
}
