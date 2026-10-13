"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Nav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="nav">
      <Link href="/" className="brand">StayFinder</Link>
      <nav>
        <Link href="/">Stays</Link>
        {loading ? null : user ? (
          <>
            <Link href="/properties/new">Add stay</Link>
            <span className="muted">{user.email}</span>
            <button
              className="link"
              onClick={async () => {
                await logout();
                router.push("/");
                router.refresh();
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/register">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
