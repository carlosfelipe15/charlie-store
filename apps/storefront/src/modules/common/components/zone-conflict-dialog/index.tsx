"use client"

import Modal from "@modules/common/components/modal"
import { Button, Heading, Text } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"

export type ZoneConflictItem = {
  id: string
  title: string
  thumbnail?: string | null
}

type ZoneConflictDialogProps = {
  open: boolean
  items: ZoneConflictItem[]
  pending: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Soft-warning confirmation shown when switching the active delivery zone
 * (or the checkout shipping address) would leave items in the cart that
 * aren't available there. Never blocks — only offers "seguir y quitarlos"
 * or "cancelar". Shared by the catalog picker and the checkout flow.
 */
const ZoneConflictDialog = ({
  open,
  items,
  pending,
  onConfirm,
  onCancel,
}: ZoneConflictDialogProps) => {
  return (
    <Modal isOpen={open} close={onCancel} size="small" data-testid="zone-conflict-dialog">
      <Modal.Title>
        <Heading className="mb-2">Productos no disponibles en esta zona</Heading>
      </Modal.Title>
      <Modal.Body>
        <Text className="text-small-regular text-ui-fg-subtle mb-3">
          Estos productos de tu carrito no están disponibles en la zona elegida. Si
          continuás, se van a quitar del carrito:
        </Text>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="w-10 shrink-0">
                <Thumbnail thumbnail={item.thumbnail} size="square" variant="rodi" />
              </div>
              <span className="text-small-regular">{item.title}</span>
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={pending}
          data-testid="zone-conflict-cancel"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          data-testid="zone-conflict-confirm"
        >
          {pending ? "Actualizando…" : "Continuar y quitar del carrito"}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ZoneConflictDialog
