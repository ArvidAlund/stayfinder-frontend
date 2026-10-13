"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "./AuthProvider";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/";
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await (isLogin ? login : register)(String(f.get("email")), String(f.get("password")));
      router.push(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, "Could not reach the server"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card form narrow" noValidate>
      <h1>{isLogin ? "Log in" : "Create account"}</h1>
      <label>
        Email
        <input name="email" type="email" autoComplete="email" />
        {error?.details.email && <span className="field-error">{error.details.email}</span>}
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} />
        {error?.details.password && <span className="field-error">{error.details.password}</span>}
      </label>
      {error && !Object.keys(error.details).length && <p className="error" role="alert">{error.message}</p>}
      <button disabled={busy}>{busy ? "Please wait…" : isLogin ? "Log in" : "Sign up"}</button>
      <p className="muted">
        {isLogin ? (
          <>No account? <Link href="/register">Sign up</Link></>
        ) : (
          <>Already registered? <Link href="/login">Log in</Link></>
        )}
      </p>
    </form>
  );
}
