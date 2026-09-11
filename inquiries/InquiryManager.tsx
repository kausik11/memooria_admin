"use client";
import { useState } from "react";
import { useResource } from "@/hooks/useResource";
import { api } from "@/services/api";
import PageHeading from "@/components/PageHeading";
import ResourceState from "@/components/ResourceState";
type Inquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  creator?: { businessName: string };
  service: string;
  date: string;
  message: string;
  status: string;
  createdAt: string;
};
export default function InquiryManager() {
  const { data, error, loading, reload } =
    useResource<Inquiry[]>("/admin/inquiries");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  return (
    <>
      <PageHeading
        title="Good things start with hello."
        description="Follow every conversation from the first inquiry to a completed connection."
      />
      <ResourceState {...{ loading, error, reload }} />
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", "New", "Contacted", "Completed"].map((s) => (
          <button
            key={s}
            className={`btn ${s === filter ? "" : "btn-outline"}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {message && (
        <p role="alert" className="error-box mb-5">
          {message}
        </p>
      )}
      <div className="space-y-4">
        {data
          ?.filter((i) => filter === "All" || i.status === filter)
          .map((i) => (
            <article key={i._id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="mb-2 text-base font-semibold">
                    {i.name} <span className="badge ml-2">{i.status}</span>
                  </h2>
                  <p className="muted text-xs">
                    {i.creator?.businessName || "Memooria team"} ·{" "}
                    {i.service || "General inquiry"} ·{" "}
                    {i.date || "Date to be decided"}
                  </p>
                </div>
                <label className="field">
                  Inquiry status
                  <select
                    aria-label={`Status for ${i.name}`}
                    value={i.status}
                    disabled={busy === i._id}
                    onChange={async (e) => {
                      setBusy(i._id);
                      setMessage("");
                      try {
                        await api(`/admin/inquiries/${i._id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: e.target.value }),
                        });
                        await reload();
                      } catch (e) {
                        setMessage(
                          e instanceof Error ? e.message : "Update failed.",
                        );
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    {["New", "Contacted", "Completed"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="my-5 whitespace-pre-line border-y border-stone-100 py-5 text-sm leading-7">
                {i.message}
              </p>
              <div className="flex flex-wrap gap-5 text-xs">
                <a className="text-brand" href={`mailto:${i.email}`}>
                  {i.email} ↗
                </a>
                <a className="text-brand" href={`tel:${i.phone}`}>
                  {i.phone}
                </a>
                <span className="muted ml-auto">
                  Received {new Date(i.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </article>
          ))}
        {data?.filter((i) => filter === "All" || i.status === filter).length ===
          0 && (
          <div className="panel py-16 text-center muted">
            No {filter === "All" ? "" : filter.toLowerCase()} inquiries yet.
          </div>
        )}
      </div>
    </>
  );
}
