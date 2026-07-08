type MedusaError = {
  response?: {
    data: { message?: string } | string
    status: number
    headers: unknown
  }
  request?: unknown
  message?: string
  config?: { url: string; baseURL: string }
}

export default function medusaError(error: unknown): never {
  const err = error as MedusaError
  if (err.response) {
    const u = new URL(err.config?.url ?? "", err.config?.baseURL ?? "")
    console.error("Resource:", u.toString())
    console.error("Response data:", err.response.data)
    console.error("Status code:", err.response.status)
    console.error("Headers:", err.response.headers)

    const data = err.response.data
    const message =
      typeof data === "object" && data !== null
        ? data.message || String(data)
        : data

    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
  } else if (err.request) {
    throw new Error("No response received: " + String(err.request))
  } else {
    throw new Error("Error setting up the request: " + err.message)
  }
}

/**
 * Non-throwing variant of {@link medusaError}: extracts a human-readable message
 * from a Medusa/SDK error without throwing. Use this inside server actions that
 * must RETURN a serializable error instead of throwing — thrown server-action
 * errors get masked by Next.js in production (surfacing only a generic 500),
 * which is why an invalid promo code showed no feedback to the user.
 */
export function getMedusaErrorMessage(error: unknown): string {
  const err = error as MedusaError
  if (err?.response) {
    const data = err.response.data
    const message =
      typeof data === "object" && data !== null
        ? data.message || String(data)
        : data
    if (message) {
      return message.charAt(0).toUpperCase() + message.slice(1) + "."
    }
  }
  if (err?.message) {
    return err.message
  }
  return "Ocurrió un error inesperado."
}
