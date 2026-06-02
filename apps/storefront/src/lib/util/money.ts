import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString()
}

/** Rodi-style display for major units (design-reference `cop()`). */
export const formatRodiMajorUnits = (
  amount: number,
  currencyCode = "cop",
  locale = "es-CO"
): string => {
  const code = currencyCode.toLowerCase()
  if (code === "cop" || code === "mxn") {
    return "$" + amount.toLocaleString(locale)
  }
  return convertToLocale({
    amount,
    currency_code: currencyCode,
    locale,
  })
}

/** Medusa amounts are in minor units (e.g. centavos). */
export const formatRodiFromMinorUnits = (
  amountMinor: number,
  currencyCode = "cop",
  locale = "es-CO"
): string => formatRodiMajorUnits(amountMinor / 100, currencyCode, locale)
