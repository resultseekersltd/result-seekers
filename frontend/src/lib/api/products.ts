import { ApiError, apiFetch, type ApiCollectionResponse, type ApiSingleResponse } from "@/lib/api/client";
import type { Product } from "@/types/product";

/**
 * Fetches the product catalogue for nav/footer use.
 *
 * Falls back to an empty array on failure — see getSolutions() for why.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { data } = await apiFetch<ApiCollectionResponse<Product>>("/products");
    return data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export type GetProductResult =
  | { status: "found"; product: Product }
  | { status: "not-found" }
  | { status: "error" };

/**
 * Fetches a single product by slug for the Product Detail Page
 * (/products/[slug]). Unlike getProducts(), this can't just fall back to
 * an empty value on any failure — the page needs to tell "no such product"
 * (→ notFound()) apart from "the API is unreachable" (→ ErrorState), so
 * both are returned as a discriminated result instead of throwing.
 */
export async function getProduct(slug: string): Promise<GetProductResult> {
  try {
    const { data } = await apiFetch<ApiSingleResponse<Product>>(`/products/${slug}`);
    return { status: "found", product: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: "not-found" };
    }
    console.error(`Failed to fetch product "${slug}":`, error);
    return { status: "error" };
  }
}
