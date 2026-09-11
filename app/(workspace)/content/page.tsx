"use client";
import { useState, useEffect, type FormEvent } from "react";
import { useResource } from "@/hooks/useResource";
import { api } from "@/services/api";
import type { Content } from "@/services/types";
import ImageField from "@/components/ImageField";
import PageHeading from "@/components/PageHeading";
import ResourceState from "@/components/ResourceState";
export default function ContentEditor() {
  const { data, error, loading, reload } = useResource<Content>("/content");
  const [slides, setSlides] = useState<Content["slides"]>([]);
  const [gallery, setGallery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (data) {
      setSlides(data.slides);
      setGallery(data.gallery.join("\n"));
    }
  }, [data]);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/admin/content", {
        method: "PUT",
        body: JSON.stringify({
          slides,
          gallery: gallery.split("\n").filter(Boolean),
        }),
      });
      setMessage("Homepage content saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="Set the scene."
        description="Curate the photography customers see on the homepage."
      />
      <ResourceState {...{ loading, error, reload }} />
      {data && (
        <form onSubmit={save} className="panel max-w-3xl space-y-6">
          <h2 className="display text-2xl">Hero carousel</h2>
          {slides.map((s, i) => (
            <div
              className="grid gap-4 rounded-lg border border-stone-200 p-5"
              key={i}
            >
              <label className="field">
                Slide label
                <input
                  required
                  value={s.label}
                  onChange={(e) =>
                    setSlides(
                      slides.map((x, j) =>
                        i === j ? { ...x, label: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <ImageField
                label="Image"
                value={s.image}
                onChange={(image) =>
                  setSlides(
                    slides.map((x, j) => (i === j ? { ...x, image } : x)),
                  )
                }
              />
              <button
                type="button"
                className="justify-self-start text-xs text-red-600"
                onClick={() => setSlides(slides.filter((_, j) => j !== i))}
              >
                Remove slide
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={slides.length >= 8}
            className="btn btn-outline"
            onClick={() => setSlides([...slides, { image: "", label: "" }])}
          >
            + Add slide
          </button>
          <label className="field">
            Gallery images (one URL per line)
            <textarea
              value={gallery}
              onChange={(e) => setGallery(e.target.value)}
              rows={5}
            />
          </label>
          {message && (
            <p role="status" className="text-brand text-sm">
              {message}
            </p>
          )}
          <button disabled={busy} className="btn">
            {busy ? "Saving…" : "Save homepage"}
          </button>
        </form>
      )}
    </>
  );
}
