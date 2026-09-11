"use client";
import { useState, type FormEvent } from "react";
import type { Creator, Service } from "@/services/types";
import ImageField from "@/components/ImageField";
import { api } from "@/services/api";
export const emptyCreator: Creator = {
  _id: "",
  businessName: "",
  ownerName: "",
  slug: "",
  profileImage: "",
  coverImage: "",
  email: "",
  phone: "",
  category: "",
  location: "",
  city: "",
  state: "",
  description: "",
  services: [],
  gallery: [],
  packages: [],
  availability: [],
  rating: 0,
  reviewCount: 0,
  featured: false,
  status: "Pending",
  socialLinks: { instagram: "", facebook: "", website: "" },
};
export default function CreatorEditor({
  creator,
  services,
  onSaved,
}: {
  creator: Creator;
  services: Service[];
  onSaved: () => void;
}) {
  const [c, setC] = useState(creator);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState("");
  const [galleryText, setGalleryText] = useState(creator.gallery.join("\n"));
  function field(key: keyof Creator, value: unknown) {
    setC((s) => ({ ...s, [key]: value }));
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/admin/creator${c._id ? `/${c._id}` : ""}`, {
        method: c._id ? "PUT" : "POST",
        body: JSON.stringify({
          ...c,
          services: c.services.map((s) => s.trim()).filter(Boolean),
          gallery: galleryText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            "businessName",
            "ownerName",
            "slug",
            "email",
            "phone",
            "location",
            "city",
            "state",
          ] as const
        ).map((key) => (
          <label key={key} className="field capitalize">
            {key.replace(/([A-Z])/g, " $1")}
            <input
              value={c[key]}
              type={key === "email" ? "email" : "text"}
              required={key !== "city" && key !== "state"}
              onChange={(e) => field(key, e.target.value)}
            />
          </label>
        ))}
        <label className="field">
          Category
          <select
            required
            value={c.category}
            onChange={(e) => field("category", e.target.value)}
          >
            <option value="">Select category</option>
            {services.map((s) => (
              <option key={s._id}>{s.title}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Status
          <select
            value={c.status}
            onChange={(e) => field("status", e.target.value)}
          >
            {["Active", "Inactive", "Pending"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <ImageField
          label="Profile image"
          value={c.profileImage}
          onChange={(v) => field("profileImage", v)}
        />
        <ImageField
          label="Cover image"
          value={c.coverImage}
          onChange={(v) => field("coverImage", v)}
        />
      </div>
      <label className="field">
        About the business
        <textarea
          value={c.description}
          minLength={20}
          required
          onChange={(e) => field("description", e.target.value)}
        />
      </label>
      <label className="field">
        Services offered (one per line)
        <textarea
          value={c.services.join("\n")}
          onChange={(e) => field("services", e.target.value.split("\n"))}
        />
      </label>
      <label className="field">
        Gallery image URLs (one per line)
        <textarea
          value={galleryText}
          onChange={(e) => setGalleryText(e.target.value)}
        />
      </label>
      <section>
        <h3 className="font-semibold">Pricing packages</h3>
        {c.packages.map((p, i) => (
          <div
            className="mb-3 grid grid-cols-[1fr_1fr_auto] gap-3 rounded-lg border border-stone-200 p-3"
            key={i}
          >
            <label className="field">
              Package name
              <input
                value={p.name}
                required
                onChange={(e) =>
                  field(
                    "packages",
                    c.packages.map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label className="field">
              Price (₹)
              <input
                type="number"
                min="0"
                required
                value={p.price}
                onChange={(e) =>
                  field(
                    "packages",
                    c.packages.map((x, j) =>
                      j === i ? { ...x, price: Number(e.target.value) } : x,
                    ),
                  )
                }
              />
            </label>
            <button
              type="button"
              aria-label={`Remove ${p.name} package`}
              onClick={() =>
                field(
                  "packages",
                  c.packages.filter((_, j) => j !== i),
                )
              }
            >
              ×
            </button>
            <label className="field col-span-3">
              Description
              <input
                value={p.description}
                onChange={(e) =>
                  field(
                    "packages",
                    c.packages.map((x, j) =>
                      j === i ? { ...x, description: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
          </div>
        ))}
        <button
          className="btn btn-outline"
          type="button"
          onClick={() =>
            field("packages", [
              ...c.packages,
              { name: "", price: 0, description: "" },
            ])
          }
        >
          + Add package
        </button>
      </section>
      <section>
        <h3 className="font-semibold">Availability</h3>
        <p className="muted text-xs">
          Only these dates will be shown as available. An inquiry does not
          reserve the date.
        </p>
        <div className="flex gap-3">
          <input
            className="input max-w-52"
            type="date"
            aria-label="Available date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => {
              if (date)
                field(
                  "availability",
                  [...new Set([...c.availability, date])].sort(),
                );
              setDate("");
            }}
          >
            Add date
          </button>
        </div>
        <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-auto">
          {c.availability.map((d) => (
            <button
              type="button"
              className="badge"
              key={d}
              aria-label={`Remove available date ${d}`}
              onClick={() =>
                field(
                  "availability",
                  c.availability.filter((v) => v !== d),
                )
              }
            >
              {d} ×
            </button>
          ))}
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-3">
        {(["instagram", "facebook", "website"] as const).map((k) => (
          <label className="field capitalize" key={k}>
            {k}
            <input
              type="url"
              value={c.socialLinks[k]}
              onChange={(e) =>
                field("socialLinks", { ...c.socialLinks, [k]: e.target.value })
              }
            />
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={c.featured}
          onChange={(e) => field("featured", e.target.checked)}
        />
        Feature on homepage
      </label>
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      <button className="btn" disabled={busy}>
        {busy ? "Saving…" : "Save creator"}
      </button>
    </form>
  );
}
