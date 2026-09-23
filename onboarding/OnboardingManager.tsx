"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { useResource } from "@/hooks/useResource";
import PageHeading from "@/components/PageHeading";
import ResourceState from "@/components/ResourceState";
type Answer = string | number | boolean | string[];
type Registration = { _id: string; name: string; email: string; phone?: string; createdAt: string; onboarding?: { city?: string; interests?: string[]; occasion?: string; completed?: boolean }; draft?: { answers: Record<string, Answer>; updatedAt: string }; creator?: { _id: string; businessName: string; status: string; application: Record<string, Answer> } };
type Question = { id: string; label: string; type: string; options?: string[]; optional?: boolean; minLength?: number; min?: number; max?: number; when?: { id: string; value: string } };
type Config = { services: string[]; questions: Question[] };
type Tab = "applications" | "drafts" | "users";
export default function OnboardingManager() {
  const { data, error, loading, reload } = useResource<Registration[]>("/admin/onboarding");
  const [tab, setTab] = useState<Tab>("applications");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Registration>();
  const [version, setVersion] = useState(0);
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const rows = (data || []).filter(r => tab === "applications" ? !!r.creator : tab === "drafts" ? !!r.draft && !r.creator : true).filter(r => !status || r.creator?.status === status).filter(r => `${r.name} ${r.email} ${r.creator?.businessName || ""} ${r.creator?.application.service || r.draft?.answers.service || ""}`.toLowerCase().includes(search.toLowerCase()));
  function edit(row: Registration) { setSelected(row); setVersion(v => v + 1); dialog.current?.showModal(); }
  return <>
    <PageHeading title="Registration & applications" description="Review creator applications, manage user details and see unfinished creator registrations." />
    <div className="mb-5 flex flex-wrap gap-3">{([['applications', 'Creator applications'], ['drafts', 'Unfinished drafts'], ['users', 'User accounts']] as const).map(([key, label]) => <button type="button" className={`btn ${tab === key ? "" : "btn-outline"}`} aria-pressed={tab === key} key={key} onClick={() => { setTab(key); setStatus(""); }}>{label}</button>)}</div>
    <ResourceState {...{ loading, error, reload }} />
    {message && <p role="status" className="mb-4 text-sm text-emerald-700">{message}</p>}
    <div className="panel">
      <div className="mb-5 flex flex-wrap gap-3"><input className="input max-w-sm" aria-label="Search registrations" placeholder="Search name, email, business or service" value={search} onChange={e => setSearch(e.target.value)} />{tab === "applications" && <select className="input max-w-48" aria-label="Filter application status" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{["Pending", "Active", "Inactive"].map(s => <option key={s}>{s}</option>)}</select>}</div>
      <div className="overflow-x-auto"><table><thead><tr><th>Name</th><th>Email</th><th>{tab === "users" ? "Interests" : "Service"}</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(r => <tr key={r._id}><td><b>{r.creator?.businessName || r.name}</b>{r.creator && <p className="muted text-xs">{r.name}</p>}</td><td>{r.email}</td><td>{tab === "users" ? r.onboarding?.interests?.join(", ") || "Not provided" : String(r.creator?.application.service || r.draft?.answers.service || "Not selected")}</td><td><span className="badge">{tab === "users" ? r.onboarding?.completed ? "Completed" : "Account created" : r.creator?.status || "Draft"}</span></td><td><button className="text-brand" onClick={() => edit(r)}>{tab === "drafts" ? "View draft" : "Review / edit"}</button></td></tr>)}</tbody></table></div>
      {!loading && !error && !rows.length && <p className="muted py-8">No registrations match these filters.</p>}
    </div>
    <dialog ref={dialog}><div className="mb-6 flex items-center justify-between gap-6"><h2 className="display text-3xl">{tab === "users" ? "Manage account" : tab === "drafts" ? "Unfinished application" : "Review application"}</h2><button type="button" className="p-3" aria-label="Close registration editor" onClick={() => dialog.current?.close()}>×</button></div>
      {selected && <RegistrationEditor key={version} record={selected} tab={tab} onSaved={() => { dialog.current?.close(); setMessage("Changes saved."); void reload(); }} />}
    </dialog>
  </>;
}
function RegistrationEditor({ record, tab, onSaved }: { record: Registration; tab: Tab; onSaved: () => void }) {
  const original = record.creator?.application || record.draft?.answers || {};
  const [answers, setAnswers] = useState(original);
  const [status, setStatus] = useState(record.creator?.status || "Pending");
  const [user, setUser] = useState({ name: record.name, email: record.email, phone: record.phone || "", city: record.onboarding?.city || "", interests: record.onboarding?.interests || [], occasion: record.onboarding?.occasion || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [identityUrl, setIdentityUrl] = useState("");
  const { data: config, loading, error: loadError, reload } = useResource<Config>(`/onboarding/questions?kind=${tab === "users" ? "user" : "creator"}&service=${encodeURIComponent(String(original.service || ""))}`);
  const visible = config?.questions.filter(q => !q.when || answers[q.when.id] === q.when.value) || [];
  async function save(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      if (tab === "users") await api(`/admin/onboarding/users/${record._id}`, { method: "PATCH", body: JSON.stringify(user) });
      else {
        const changes = Object.fromEntries(visible.filter(q => !["service", "image", "images", "checkbox"].includes(q.type) && answers[q.id] !== original[q.id]).map(q => [q.id, answers[q.id] ?? ""]));
        await api(`/admin/onboarding/creators/${record.creator!._id}`, { method: "PATCH", body: JSON.stringify({ status, answers: changes }) });
      }
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save changes."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="space-y-5">
    <p className="muted text-sm">{record.name} · {record.email}</p>
    <ResourceState loading={loading} error={loadError} reload={reload} />
    {tab === "users" ? <>
      {([['name', 'Full name'], ['email', 'Email address'], ['phone', 'Phone'], ['city', 'City']] as const).map(([key, label]) => <label className="field" key={key}>{label}<input type={key === "email" ? "email" : "text"} required={key === "name" || key === "email"} maxLength={key === "phone" ? 30 : 500} value={user[key]} onChange={e => setUser(u => ({ ...u, [key]: e.target.value }))} /></label>)}
      <fieldset><legend className="mb-3 text-sm font-semibold">Interested in</legend><div className="grid gap-3 sm:grid-cols-2">{[...new Set([...(config?.services || []), ...user.interests])].map(s => <label className="flex gap-2 text-sm" key={s}><input type="checkbox" checked={user.interests.includes(s)} onChange={e => setUser(u => ({ ...u, interests: e.target.checked ? [...u.interests, s] : u.interests.filter(v => v !== s) }))} />{s}</label>)}</div></fieldset>
      <label className="field">Planning for<select value={user.occasion} onChange={e => setUser(u => ({ ...u, occasion: e.target.value }))}><option value="">Not provided</option>{["Wedding", "Family celebration", "Creative project", "Business event", "Just exploring"].map(s => <option key={s}>{s}</option>)}</select></label>
    </> : <>
      {tab === "drafts" && <p className="text-sm muted">This application has not been submitted. Answers shown here are the applicant’s saved progress.</p>}
      {visible.map(q => <div key={q.id}>
        {["image", "images"].includes(q.type) ? <div><p className="text-sm font-semibold">{q.label}</p>{q.id === "idCard" ? <>
          <p className="muted text-xs">{answers.idCard ? "Private identity document uploaded" : "Not uploaded"}</p>
          {record.creator && answers.idCard && <button type="button" className="btn btn-outline" disabled={busy} onClick={async () => { setError(""); setIdentityUrl(""); try { const result = await api<{ url: string }>(`/admin/creator/${record.creator!._id}/identity`); setIdentityUrl(result.url); } catch (e) { setError(e instanceof Error ? e.message : "Unable to open ID."); } }}>Prepare private ID link</button>}
          {identityUrl && <a className="block mt-3 text-brand underline text-sm" href={identityUrl} target="_blank" rel="noopener noreferrer">Open ID document (expires in 5 minutes)</a>}
        </> : <div className="flex flex-wrap gap-3 mt-2">{(Array.isArray(answers[q.id]) ? answers[q.id] as string[] : answers[q.id] ? [String(answers[q.id])] : []).filter(url => url.startsWith("https://res.cloudinary.com/")).map(url => <a href={url} target="_blank" rel="noopener noreferrer" key={url}><img src={url} alt={q.label} className="h-28 w-28 rounded object-cover" /></a>)}</div>}</div>
        : q.type === "service" || q.type === "checkbox" || tab === "drafts" ? <div><p className="text-sm font-semibold">{q.label}</p><p className="muted text-sm whitespace-pre-wrap">{String(answers[q.id] ?? "Not answered")}</p></div>
        : <label className="field">{q.label}{q.type === "select" ? <select required={!q.optional} value={String(answers[q.id] ?? "")} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}><option value="">Select</option>{q.options?.map(s => <option key={s}>{s}</option>)}</select> : q.type === "textarea" ? <textarea required={!q.optional} minLength={q.minLength} maxLength={5000} value={String(answers[q.id] ?? "")} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} /> : <input type={q.type} required={!q.optional} minLength={q.minLength} maxLength={5000} min={q.min ?? 0} max={q.max} step={q.id === "perDayRate" ? "0.01" : "1"} value={String(answers[q.id] ?? "")} onChange={e => setAnswers(a => ({ ...a, [q.id]: q.type === "number" && e.target.value ? Number(e.target.value) : e.target.value }))} />}</label>}
      </div>)}
      {record.creator && <><label className="field">Review status<select value={status} onChange={e => setStatus(e.target.value)}><option value="Pending">Pending review</option><option value="Active">Approved — visible in marketplace</option><option value="Inactive">Inactive — hidden from marketplace</option></select></label><p className="text-xs muted">Changes to the business name, phone, bio, city, state and daily rate also update the creator profile. Use <Link href="/creators" className="underline text-brand">Creators</Link> to manage portfolio images, packages and availability.</p></>}
    </>}
    {error && <p className="error-box" role="alert">{error}</p>}
    {tab !== "drafts" && <button className="btn" disabled={busy || loading || !!loadError}>{busy ? "Saving…" : "Save changes"}</button>}
  </form>;
}
