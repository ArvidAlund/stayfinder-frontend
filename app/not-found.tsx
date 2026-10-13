import Link from "next/link";

export default function NotFound() {
  return (
    <div className="center">
      <h1>Stay not found</h1>
      <p className="muted">It may have been removed, or the link is wrong.</p>
      <Link href="/">Back to all stays</Link>
    </div>
  );
}
