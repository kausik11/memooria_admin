"use client";
import { useState } from "react";
import { useResource } from "@/hooks/useResource";
import { api } from "@/services/api";
import PageHeading from "@/components/PageHeading";
import ResourceState from "@/components/ResourceState";
type Review = {
  _id: string;
  customer: string;
  creator?: { businessName: string };
  rating: number;
  comment: string;
  approved: boolean;
};
export default function Reviews() {
  const { data, error, loading, reload } =
    useResource<Review[]>("/admin/reviews");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  return (
    <>
      <PageHeading
        title="Real experiences. Thoughtfully shared."
        description="Moderate reviews before they appear publicly. Only approved reviews contribute to ratings."
      />
      <ResourceState {...{ loading, error, reload }} />
      {message && (
        <p role="alert" className="error-box mb-5">
          {message}
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {data?.map((r) => (
          <article key={r._id} className="panel">
            <span className="text-amber-600">{"★".repeat(r.rating)}</span>
            <span className="badge float-right">
              {r.approved ? "Published" : "Pending"}
            </span>
            <h2 className="mt-4 font-semibold">{r.customer}</h2>
            <p className="muted text-xs">
              {r.creator?.businessName || "Removed creator"}
            </p>
            <p className="my-5 leading-7">{r.comment}</p>
            <button
              disabled={busy === r._id}
              className="btn btn-outline"
              onClick={async () => {
                setBusy(r._id);
                setMessage("");
                try {
                  await api(`/admin/reviews/${r._id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ approved: !r.approved }),
                  });
                  await reload();
                } catch (e) {
                  setMessage(e instanceof Error ? e.message : "Update failed.");
                } finally {
                  setBusy("");
                }
              }}
            >
              {r.approved ? "Unpublish review" : "Approve review"}
            </button>
          </article>
        ))}
      </div>
      {data?.length === 0 && <p className="muted">No reviews to moderate.</p>}
    </>
  );
}
