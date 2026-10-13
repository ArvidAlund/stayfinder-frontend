import { notFound } from "next/navigation";
import OwnerActions from "@/components/OwnerActions";
import { getProperty, money } from "@/lib/properties";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const property = await getProperty((await params).id);
  if (!property) notFound(); // G13: own page for missing stays

  return (
    <>
      <h1>{property.title}</h1>
      <p className="muted">{property.location} · up to {property.max_guests} guests</p>
      <p className="price">{money(property.price_per_night)} / night</p>
      <p>{property.description}</p>
      <OwnerActions property={property} />
    </>
  );
}
