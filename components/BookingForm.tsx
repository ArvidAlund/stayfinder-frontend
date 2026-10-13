"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import { nightsBetween, today } from "@/lib/dates";
import { money } from "@/lib/properties";
import type { Booking, BookingInput, Property } from "@/lib/types";
import { useAuth } from "./AuthProvider";

type Props = {
  property: Property;
  booking?: Booking; // set when editing
  onSaved: (b: Booking) => void;
  onCancel?: () => void;
};

export default function BookingForm({ property, booking, onSaved, onCancel }: Props) {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState(booking?.guest_email ?? "");
  const [checkIn, setCheckIn] = useState(booking?.check_in ?? "");
  const [checkOut, setCheckOut] = useState(booking?.check_out ?? "");
  const [guests, setGuests] = useState(String(booking?.guests ?? 1));
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  // the user arrives asynchronously after the first render; prefill the email once
  useEffect(() => {
    if (user) setEmail((cur) => cur || user.email);
  }, [user]);

  if (loading) return null;
  // G9: logged-out visitors are asked to log in
  if (!user) {
    return (
      <div className="card">
        <p>
          <Link href={`/login?next=${encodeURIComponent(`/properties/${property.id}`)}`}>Log in</Link> or{" "}
          <Link href="/register">sign up</Link> to book this stay.
        </p>
      </div>
    );
  }

  // G11: preview only. The server calculates the real price and stores it (VG6).
  const nights = nightsBetween(checkIn, checkOut);
  const unitPrice = booking?.price_per_night ?? property.price_per_night;
  const total = nights * unitPrice;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body: BookingInput = { guest_email: email, check_in: checkIn, check_out: checkOut, guests: Number(guests) };
    setBusy(true);
    setError(null);
    try {
      const saved = booking
        ? await api<Booking>(`/bookings/${booking.id}`, { method: "PATCH", body })
        : await api<Booking>(`/properties/${property.id}/bookings`, { method: "POST", body });
      onSaved(saved);
      if (!booking) {
        setCheckIn("");
        setCheckOut("");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, "Could not reach the server"));
    } finally {
      setBusy(false);
    }
  }

  const fe = (k: string) => error?.details[k] && <span className="field-error">{error.details[k]}</span>;

  return (
    <form onSubmit={onSubmit} className="card form" noValidate>
      <h2>{booking ? "Edit booking" : "Book this stay"}</h2>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />{fe("guest_email")}</label>
      <label>Check-in<input type="date" min={today()} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />{fe("check_in")}</label>
      <label>Check-out<input type="date" min={checkIn || today()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />{fe("check_out")}</label>
      <label>Guests (max {property.max_guests})<input type="number" value={guests} onChange={(e) => setGuests(e.target.value)} />{fe("guests")}</label>

      <p aria-live="polite">
        {nights > 0 ? (
          <>
            <strong>{nights} {nights === 1 ? "night" : "nights"}</strong> × {money(unitPrice)} = <strong>{money(total)}</strong>
          </>
        ) : (
          <span className="muted">Pick dates to see the total price.</span>
        )}
      </p>

      {error && !Object.keys(error.details).length && <p className="error" role="alert">{error.message}</p>}
      <div className="row">
        <button disabled={busy}>{busy ? "Saving…" : booking ? "Save changes" : "Book"}</button>
        {onCancel && <button type="button" className="secondary" onClick={onCancel}>Close</button>}
      </div>
    </form>
  );
}
