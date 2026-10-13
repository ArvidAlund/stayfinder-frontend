# StayFinder frontend

Next.js (App Router) + TypeScript. Talks to the StayFinder API with `credentials: "include"` so the session cookie is sent.

```
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8787
npm run dev                  # http://localhost:3000
```

- Public pages (list, detail) are server components; auth-dependent UI (nav, booking, owner actions) are client components.
- `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx` cover G13.
- Price shown in the booking form is a preview; the server calculates and stores the real price.
