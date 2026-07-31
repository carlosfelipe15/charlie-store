import { Disclosure } from "@headlessui/react"
import { clx } from "@modules/common/components/ui"
import { RodiBtn } from "@modules/common/components/rodi"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "Ocurrió un error, por favor inténtalo de nuevo",
  children,
  'data-testid': dataTestid
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="text-small-regular" data-testid={dataTestid}>
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="uppercase text-[11px] font-extrabold text-rm-ink-3 tracking-wider">
            {label}
          </span>
          <div className="flex items-center flex-1 basis-0 justify-end gap-x-4">
            {typeof currentInfo === "string" ? (
              <span
                className="font-semibold text-rm-ink"
                data-testid="current-info"
              >
                {currentInfo}
              </span>
            ) : (
              currentInfo
            )}
          </div>
        </div>
        <div>
          <RodiBtn
            kind="ghost"
            size="sm"
            className="w-[100px]"
            onClick={handleToggle}
            type={state ? "reset" : "button"}
            data-testid="edit-button"
            data-active={state}
          >
            {state ? "Cancelar" : "Editar"}
          </RodiBtn>
        </div>
      </div>

      {/* Success state */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isSuccess,
              "max-h-0 opacity-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <span className="inline-flex items-center rounded-rm-pill px-3 py-1.5 my-4 text-sm font-semibold bg-rm-s-mint text-rm-green">
            {label} actualizado correctamente
          </span>
        </Disclosure.Panel>
      </Disclosure>

      {/* Error state  */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isError,
              "max-h-0 opacity-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <span className="inline-flex items-center rounded-rm-pill px-3 py-1.5 my-4 text-sm font-semibold bg-rm-s-pink text-rm-red">
            {errorMessage}
          </span>
        </Disclosure.Panel>
      </Disclosure>

      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-visible",
            {
              "max-h-[1000px] opacity-100": state,
              "max-h-0 opacity-0": !state,
            }
          )}
        >
          <div className="flex flex-col gap-y-2 py-4">
            <div>{children}</div>
            <div className="flex items-center justify-end mt-2">
              <RodiBtn
                disabled={pending}
                className="w-full small:max-w-[140px]"
                type="submit"
                data-testid="save-button"
              >
                {pending ? "Procesando…" : "Guardar cambios"}
              </RodiBtn>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}

export default AccountInfo
