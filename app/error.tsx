"use client";

export default function ErrorView({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="center">
      <h1>Something went wrong</h1>
      <p className="muted">We could not load the data. Is the API running?</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
