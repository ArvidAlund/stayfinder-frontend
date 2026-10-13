"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import type { Property, PropertyInput } from "@/lib/types";
import { useAuth } from "./AuthProvider";

export default function PropertyForm({ property }: { property?: Property }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <p className="muted">Loading…</p>;
  if (!user) {
    return (
      <p>
        <Link href={`/login?next=${encodeURIComponent(property ? `/properties/${property.id}/edit` : "/properties/new")}`}>Log in</Link>{" "}
        to {property ? "edit" : "add"} a stay.
      </p>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body: PropertyInput = {
      title: String(f.get("title")),
      description: String(f.get("description")),
      location: String(f.get("location")),
      price_per_night: Number(f.get("price_per_night")),
      max_guests: Number(f.get("max_guests")),
    };
    setBusy(true);
    setError(null);
    try {
      const saved = property
        ? await api<Property>(`/properties/${property.id}`, { method: "PATCH", body })
        : await api<Property>("/properties", { method: "POST", body });
      router.push(`/properties/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, "Could not reach the server"));
      setBusy(false);
    }
  }

  const fe = (k: string) => error?.details[k] && <span className="field-error">{error.details[k]}</span>;

  return (
    <form onSubmit={onSubmit} className="card form" noValidate>
      <h1>{property ? "Edit stay" : "Add a stay"}</h1>
      <label>Title<input name="title" defaultValue={property?.title} />{fe("title")}</label>
      <label>Location<input name="location" defaultValue={property?.location} />{fe("location")}</label>
      <label>Description<textarea name="description" rows={4} defaultValue={property?.description} />{fe("description")}</label>
      <label>Price per night (SEK)<input name="price_per_night" type="number" step="1" defaultValue={property?.price_per_night} />{fe("price_per_night")}</label>
      <label>Max guests<input name="max_guests" type="number" defaultValue={property?.max_guests} />{fe("max_guests")}</label>
      {error && !Object.keys(error.details).length && <p className="error" role="alert">{error.message}</p>}
      <button disabled={busy}>{busy ? "Saving…" : "Save"}</button>
    </form>
  );
}
