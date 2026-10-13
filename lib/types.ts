export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Property = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  created_at: string;
};

export type Booking = {
  id: string;
  property_id: string;
  guest_id: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: BookingStatus;
  price_per_night: number;
  total_price: number;
  created_at: string;
};

export type User = { id: string; email: string };

export type PropertyInput = Pick<Property, "title" | "description" | "location" | "price_per_night" | "max_guests">;
export type BookingInput = Pick<Booking, "guest_email" | "check_in" | "check_out" | "guests">;
