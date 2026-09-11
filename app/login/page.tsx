"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await api<{ role: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      if (user.role !== "admin") {
        await api("/auth/logout", { method: "POST" });
        throw new Error("This account does not have administrator access.");
      }
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="panel w-full max-w-md !p-9">
        <p className="display text-3xl">
          <span className="text-brand">✳</span> memooria.
        </p>
        <p className="muted mb-8 text-xs">
          Your creative community, thoughtfully managed.
        </p>
        <h1 className="display text-3xl">Welcome back.</h1>
        <form className="mt-6 grid gap-5" onSubmit={submit}>
          <label className="field">
            Admin email
            <input type="email" name="email" required autoComplete="username" />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              name="password"
              required
              minLength={10}
              maxLength={72}
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="error-box" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="btn">
            {busy ? "Signing in…" : "Sign in to workspace"}
          </button>
        </form>
      </div>
    </main>
  );
}
