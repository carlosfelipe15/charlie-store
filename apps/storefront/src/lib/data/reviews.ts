"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type StoreReview = {
  id: string
  product_id: string
  customer_id: string
  rating: number
  title: string | null
  body: string
  created_at: string
}

export type ReviewSummary = {
  product_id: string | null
  average: number
  count: number
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>
}

const EMPTY_SUMMARY: ReviewSummary = {
  product_id: null,
  average: 0,
  count: 0,
  distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
}

export const listProductReviews = async (
  productId: string
): Promise<StoreReview[]> => {
  const next = { ...(await getCacheOptions("reviews")) }

  return sdk.client
    .fetch<{ reviews: StoreReview[] }>("/store/reviews", {
      method: "GET",
      query: { product_id: productId, limit: 20 },
      next,
      cache: "force-cache",
    })
    .then(({ reviews }) => reviews ?? [])
    .catch(() => [])
}

export const getProductReviewSummary = async (
  productId: string
): Promise<ReviewSummary> => {
  const next = { ...(await getCacheOptions("reviews")) }

  return sdk.client
    .fetch<ReviewSummary>("/store/reviews/summary", {
      method: "GET",
      query: { product_id: productId },
      next,
      cache: "force-cache",
    })
    .catch(() => EMPTY_SUMMARY)
}

/** Sitewide rating aggregate, e.g. for the auth panel's "X reseñas" stat. */
export const getSiteReviewSummary = async (): Promise<ReviewSummary> => {
  const next = { ...(await getCacheOptions("reviews")) }

  return sdk.client
    .fetch<ReviewSummary>("/store/reviews/summary", {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .catch(() => EMPTY_SUMMARY)
}

export type CreateReviewResult = { success: boolean; error: string | null }

export const createProductReview = async (input: {
  productId: string
  rating: number
  title?: string
  body: string
}): Promise<CreateReviewResult> => {
  const headers = { ...(await getAuthHeaders()) }

  if (!("authorization" in headers)) {
    return {
      success: false,
      error: "Debes iniciar sesión para dejar una reseña.",
    }
  }

  try {
    await sdk.client.fetch("/store/reviews", {
      method: "POST",
      headers,
      body: {
        product_id: input.productId,
        rating: input.rating,
        title: input.title,
        body: input.body,
      },
    })
    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo publicar la reseña.",
    }
  }
}
