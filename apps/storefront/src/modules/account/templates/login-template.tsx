"use client"

import { useState } from "react"
import { clsx } from "clsx"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import RodiAuthPanel from "@modules/account/components/rodi-auth-panel"
import { ReviewSummary } from "@lib/data/reviews"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = ({
  reviewSummary,
}: {
  reviewSummary?: ReviewSummary
}) => {
  const [currentView, setCurrentView] = useState<LOGIN_VIEW>(LOGIN_VIEW.SIGN_IN)

  return (
    <div className="min-h-[calc(100vh-120px)] grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-rm-paper -mx-[var(--content-padding,0)] small:mx-0 rounded-none small:rounded-rm-lg overflow-hidden border-0 small:border border-rm-line">
      <RodiAuthPanel reviewSummary={reviewSummary} />
      <div className="flex flex-col justify-center px-6 py-10 small:px-12 lg:px-14">
        <div className="max-w-[420px] w-full mx-auto">
          <div className="flex gap-1 p-1 bg-rm-line-2 rounded-xl mb-7">
            {[
              { id: LOGIN_VIEW.SIGN_IN, label: "Ingresar" },
              { id: LOGIN_VIEW.REGISTER, label: "Crear cuenta" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCurrentView(tab.id)}
                className={clsx(
                  "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all",
                  currentView === tab.id
                    ? "bg-rm-paper text-rm-ink shadow-sm"
                    : "text-rm-ink-3 hover:text-rm-ink"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {currentView === LOGIN_VIEW.SIGN_IN ? (
            <Login setCurrentView={setCurrentView} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginTemplate
