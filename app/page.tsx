import Link from "next/link";
import { ApiError } from "@/lib/api";
import { getProperties, money, type PropertyFilters } from "@/lib/properties";
import type { Property } from "@/lib/types";

type Search = { [K in keyof PropertyFilters]?: string | string[] };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function HomePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const filters: PropertyFilters = {
    location: one(sp.location),
    max_price: one(sp.max_price),
    guests: one(sp.guests),
    sort: one(sp.sort),
    from: one(sp.from),
    to: one(sp.to),
  };

  let properties: Property[] = [];
  let filterError: string | null = null;
  try {
    properties = await getProperties(filters);
  } catch (e) {
    // invalid filters (e.g. to before from) are shown inline; anything else goes to error.tsx
    if (e instanceof ApiError && e.status === 400) filterError = Object.values(e.details).join(". ") || e.message;
    else throw e;
  }

  return (
    <>
      <h1>Find a stay</h1>
      <form className="card filters" action="/">
        <label>
          Location
          <input name="location" defaultValue={filters.location} placeholder="Stockholm" />
        </label>
        <label>
          Max price / night
          <input name="max_price" type="number" min="1" defaultValue={filters.max_price} />
        </label>
        <label>
          Guests
          <input name="guests" type="number" min="1" defaultValue={filters.guests} />
        </label>
        <label>
          Available from
          <input name="from" type="date" defaultValue={filters.from} />
        </label>
        <label>
          Available to
          <input name="to" type="date" defaultValue={filters.to} />
        </label>
        <label>
          Sort by price
          <select name="sort" defaultValue={filters.sort ?? ""}>
            <option value="">Newest</option>
            <option value="price_asc">Lowest first</option>
            <option value="price_desc">Highest first</option>
          </select>
        </label>
        <button>Search</button>
      </form>

      {filterError && <p className="error" role="alert">{filterError}</p>}
      {!filterError && properties.length === 0 && <p className="muted">No stays match your search.</p>}

      <div className="grid">
        {properties.map((p) => (
          <Link key={p.id} href={`/properties/${p.id}`} className="card">
            <h2>{p.title}</h2>
            <p className="muted">{p.location} · up to {p.max_guests} guests</p>
            <p className="price">{money(p.price_per_night)} / night</p>
          </Link>
        ))}
      </div>
    </>
  );
}
