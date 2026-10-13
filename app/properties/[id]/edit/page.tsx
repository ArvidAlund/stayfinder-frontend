import { notFound } from "next/navigation";
import PropertyForm from "@/components/PropertyForm";
import { getProperty } from "@/lib/properties";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const property = await getProperty((await params).id);
  if (!property) notFound();
  return <PropertyForm property={property} />;
}
