"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { money } from "@/lib/properties";
import type { Booking, BookingStatus, Property } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import BookingForm from "./BookingForm";

export default function BookingSection({ property }: { property: Property }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isOwner = user?.id === property.owner_id;

  // The API only returns what this user may see: own bookings, or all of them for the owner.
  const load = useCallback(async () => {
    if (!user) return setBookings([]);
    try {
      setBookings(await api<Booking[]>(`/properties/${property.id}/bookings`));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load bookings");
    }
  }, [user, property.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    }
  }

  const setStatus = (b: Booking, status: Exclude<BookingStatus, "pending">) =>
    act(() => api(`/bookings/${b.id}`, { method: "PATCH", body: { status } }));
  const remove = (b: Booking) => {
    if (confirm("Delete this booking?")) act(() => api(`/bookings/${b.id}`, { method: "DELETE" }));
  };

  return (
    <aside>
      <BookingForm property={property} onSaved={load} />

      {user && (
        <>
          <h2>{isOwner ? "Bookings for your stay" : "Your bookings"}</h2>
          {error && <p className="error" role="alert">{error}</p>}
          {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
          <div className="list">
            {bookings.map((b) =>
              editing === b.id ? (
                <BookingForm
                  key={b.id}
                  property={property}
                  booking={b}
                  onSaved={() => {
                    setEditing(null);
                    load();
                  }}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div key={b.id} className="card">
                  <div className="row">
                    <strong>{b.check_in} → {b.check_out}</strong>
                    <span className={`badge ${b.status}`}>{b.status}</span>
                  </div>
                  <p className="muted">{b.guests} guests · {b.guest_email} · {money(b.total_price)}</p>
                  {b.status !== "cancelled" && (
                    <div className="row">
                      {isOwner && b.status === "pending" && <button onClick={() => setStatus(b, "confirmed")}>Confirm</button>}
                      {b.guest_id === user.id && <button className="secondary" onClick={() => setEditing(b.id)}>Edit</button>}
                      <button className="secondary" onClick={() => setStatus(b, "cancelled")}>Cancel</button>
                      {b.guest_id === user.id && <button className="danger" onClick={() => remove(b)}>Delete</button>}
                    </div>
                  )}
                  {b.status === "cancelled" && b.guest_id === user.id && (
                    <button className="danger" onClick={() => remove(b)}>Delete</button>
                  )}
                </div>
              ),
            )}
          </div>
        </>
      )}
    </aside>
  );
}
