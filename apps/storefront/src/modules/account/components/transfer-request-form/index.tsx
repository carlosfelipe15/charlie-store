"use client"
import { createTransferRequest } from "@lib/data/orders"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import { useToast } from "@modules/common/components/ui"
import { useActionState } from "react"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import RodiInput from "@modules/common/components/rodi-input"
import { useEffect, useRef, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)
  const { showToast } = useToast()
  const lastNotified = useRef<string | null>(null)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
      const key = `success:${state.order.id}`
      if (lastNotified.current !== key) {
        lastNotified.current = key
        showToast("Solicitud de transferencia enviada.", "success")
      }
    } else if (state.error) {
      const key = `error:${state.error}`
      if (lastNotified.current !== key) {
        lastNotified.current = key
        showToast(state.error, "error")
      }
    }
  }, [state.success, state.order, state.error, showToast])

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-8 gap-y-4 w-full">
        <div className="flex flex-col gap-y-1">
          <h3 className="font-display text-sm font-extrabold text-rm-ink">
            Transferir pedidos
          </h3>
          <p className="text-small-regular text-rm-ink-2">
            ¿No encuentras el pedido que buscas?
            <br /> Vincula un pedido a tu cuenta.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex flex-col gap-y-2 w-full">
            <RodiInput
              className="w-full"
              label="ID del pedido"
              name="order_id"
            />
            <SubmitButton
              className="!h-9 w-fit whitespace-nowrap self-end !px-3.5 !text-[13px]"
            >
              Solicitar transferencia
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <p className="text-base-regular text-rm-red text-right">
          {state.error}
        </p>
      )}
      {showSuccess && (
        <div className="flex justify-between p-4 rounded-rm-lg bg-rm-cream border border-rm-line w-full self-stretch items-center">
          <div className="flex gap-x-2 items-center">
            <CheckCircleMiniSolid className="w-4 h-4 text-rm-green" />
            <div className="flex flex-col gap-y-1">
              <p className="font-semibold text-rm-ink">
                Transferencia del pedido {state.order?.id} solicitada
              </p>
              <p className="text-base-regular text-rm-ink-2">
                Se envió un correo de solicitud de transferencia a{" "}
                {state.order?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="h-fit text-rm-ink-2 hover:text-rm-ink"
            onClick={() => setShowSuccess(false)}
          >
            <XCircleSolid className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
