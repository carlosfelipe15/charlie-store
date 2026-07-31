import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <h2 className="font-display text-base font-extrabold text-rm-ink">
        ¿Necesitas ayuda?
      </h2>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink
              href="/contact"
              className="text-rm-ink-2 hover:text-rm-red"
            >
              Contacto
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink
              href="/contact#devoluciones"
              className="text-rm-ink-2 hover:text-rm-red"
            >
              Devoluciones y cambios
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
