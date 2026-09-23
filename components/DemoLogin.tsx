"use client";
import { useState } from "react";
import { useResource } from "@/hooks/useResource";
import { api } from "@/services/api";
export default function DemoLogin({ admin = false }: { admin?: boolean }) {
  const { data } = useResource<{ demoMode: boolean }>("/platform"); const [busy, setBusy] = useState(false), [error, setError] = useState("");
  if (!data?.demoMode) return null;
  return <div className="mt-7 border-t pt-5"><p className="eyebrow">TRY THE DEMO</p><div className="flex flex-wrap gap-2">{(admin ? ["admin", "superadmin"] : ["customer", "photographer", "makeup"]).map(account => <button type="button" className="btn btn-outline !text-xs !px-3" disabled={busy} key={account} onClick={async () => { setBusy(true); setError(""); try { await api("/auth/login", { method: "POST", body: JSON.stringify({ email: `${account}@memooria.demo`, password: admin ? "Admin@123" : "Demo@123" }) }); window.location.href = admin ? "/dashboard" : account === "customer" ? "/customer/dashboard" : "/creator/dashboard"; } catch (e) { setError(e instanceof Error ? e.message : "Demo login unavailable. Run the demo seed first."); setBusy(false); } }}>{account}</button>)}</div>{error && <p className="error-box mt-3" role="alert">{error}</p>}</div>;
}
