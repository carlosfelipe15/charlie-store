import { RodiBtn } from "@modules/common/components/rodi"
import { RodiIconTruck } from "@modules/common/icons/rodi"

export default function RodiPdpDelivery() {
  return (
    <div className="rounded-rm-lg border border-rm-line bg-rm-paper p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-rm-md bg-rm-s-mint text-rm-green grid place-items-center shrink-0">
          <RodiIconTruck size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-rm-ink">
            Envío <span className="text-rm-green">disponible</span>
          </p>
          <p className="text-xs text-rm-ink-3">Calculado en el checkout</p>
        </div>
        <RodiBtn kind="ghost" size="sm" type="button" className="shrink-0">
          Cambiar
        </RodiBtn>
      </div>
    </div>
  )
}
