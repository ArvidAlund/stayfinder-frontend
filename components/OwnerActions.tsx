"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Property } from "@/lib/types";
import { useAuth } from "./AuthProvider";

/** Edit/delete are only offered to the owner. The API and database enforce it regardless. */
export default function OwnerActions({ property }: { property: Property }) {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (user?.id !== property.owner_id) return null;

  async function remove() {
    if (!confirm("Delete this stay and all its bookings?")) return;
    try {
      await api(`/properties/${property.id}`, { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete");
    }
  }

  return (
    <div className="row">
      <Link href={`/properties/${property.id}/edit`}>Edit</Link>
      <button className="danger" onClick={remove}>Delete</button>
      {error && <span className="error" role="alert">{error}</span>}
    </div>
  );
}
