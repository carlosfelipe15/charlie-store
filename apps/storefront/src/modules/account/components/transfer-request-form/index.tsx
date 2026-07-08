"use client"
import { createTransferRequest } from "@lib/data/orders"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import {
  Heading,
  IconButton,
  Input,
  Text,
  useToast,
} from "@modules/common/components/ui"
import { useActionState } from "react"
import { SubmitButton } from "@modules/checkout/components/submit-button"
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
          <Heading level="h3" className="!text-sm font-semibold text-neutral-950">
            Transferir pedidos
          </Heading>
          <p className="text-small-regular text-neutral-500">
            ¿No encuentras el pedido que buscas?
            <br /> Vincula un pedido a tu cuenta.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex flex-col gap-y-2 w-full">
            <Input
              className="w-full"
              name="order_id"
              placeholder="ID del pedido"
            />
            <SubmitButton
              variant="secondary"
              size="small"
              className="w-fit whitespace-nowrap self-end"
            >
              Solicitar transferencia
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <Text className="text-base-regular text-rose-500 text-right">
          {state.error}
        </Text>
      )}
      {showSuccess && (
        <div className="flex justify-between p-4 bg-neutral-50 shadow-borders-base w-full self-stretch items-center">
          <div className="flex gap-x-2 items-center">
            <CheckCircleMiniSolid className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col gap-y-1">
              <Text className="text-medim-pl text-neutral-950">
                Transferencia del pedido {state.order?.id} solicitada
              </Text>
              <Text className="text-base-regular text-neutral-600">
                Se envió un correo de solicitud de transferencia a{" "}
                {state.order?.email}
              </Text>
            </div>
          </div>
          <IconButton
            className="h-fit"
            onClick={() => setShowSuccess(false)}
          >
            <XCircleSolid className="w-4 h-4 text-neutral-500" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
