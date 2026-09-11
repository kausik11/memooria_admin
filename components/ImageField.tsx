"use client";
import { useState } from "react";
import { api } from "@/services/api";
export default function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="field">
      <label>
        {label}
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://res.cloudinary.com/…"
        />
      </label>
      <label className="cursor-pointer text-[10px] text-brand">
        {busy ? "Uploading…" : "Or upload an image (JPEG, PNG, WebP · 5 MB)"}
        <input
          className="mt-1 text-xs"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError("");
            const data = new FormData();
            data.append("image", file);
            try {
              const result = await api<{ url: string }>("/admin/upload", {
                method: "POST",
                body: data,
              });
              onChange(result.url);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Upload failed.");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {error && (
        <span role="alert" className="text-red-700">
          {error}
        </span>
      )}
    </div>
  );
}
