import { API_URL, ApiError } from "./api";
import type { Property } from "./types";

// Public data, fetched on the server (no cookies needed). Always fresh: availability changes.
async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Could not load data", data.code, data.details);
  return data as T;
}

export type PropertyFilters = {
  location?: string;
  max_price?: string;
  guests?: string;
  sort?: string;
  from?: string;
  to?: string;
};

export async function getProperties(filters: PropertyFilters): Promise<Property[]> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) if (v) qs.set(k, v);
  return (await get<Property[]>(`/properties?${qs}`)) ?? [];
}

/** null when the property does not exist (or the id is not a valid uuid). */
export function getProperty(id: string): Promise<Property | null> {
  return get<Property>(`/properties/${encodeURIComponent(id)}`).catch((e) => {
    if (e instanceof ApiError && e.status === 400) return null;
    throw e;
  });
}

export const money = (n: number) =>
  new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(n);
