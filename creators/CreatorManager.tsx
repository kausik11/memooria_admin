"use client";
import { useState, useRef } from "react";
import type { Creator, Service } from "@/services/types";
import { useResource } from "@/hooks/useResource";
import { api } from "@/services/api";
import CreatorEditor, { emptyCreator } from "./CreatorEditor";
import PageHeading from "@/components/PageHeading";
import ResourceState from "@/components/ResourceState";
export default function CreatorManager() {
  const { data, error, loading, reload } =
    useResource<Creator[]>("/admin/creators");
  const { data: services } = useResource<Service[]>("/services");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Creator>(emptyCreator);
  const [message, setMessage] = useState("");
  const [editorVersion, setEditorVersion] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  function edit(c: Creator) {
    setEditorVersion((v) => v + 1);
    setSelected({
      ...c,
      socialLinks: c.socialLinks || emptyCreator.socialLinks,
    });
    dialog.current?.showModal();
  }
  return (
    <>
      <PageHeading
        title="The people behind the moments."
        description="Curate your community. Help every creator tell their story."
        action={
          <button className="btn" onClick={() => edit({ ...emptyCreator })}>
            + Add creator
          </button>
        }
      />
      <ResourceState {...{ loading, error, reload }} />
      {message && (
        <p role="status" className="error-box mb-4">
          {message}
        </p>
      )}
      <div className="panel">
        <input
          className="input mb-5 max-w-sm"
          placeholder="Search name, city, or category…"
          aria-label="Search creators"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data
                ?.filter((c) =>
                  `${c.businessName} ${c.location} ${c.category}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((c) => (
                  <tr key={c._id}>
                    <td>
                      <b>{c.businessName}</b>
                      <p className="muted mb-0 mt-1 text-[10px]">
                        {c.ownerName}
                        {c.featured ? " · Featured" : ""}
                      </p>
                    </td>
                    <td>{c.category}</td>
                    <td>{c.city}</td>
                    <td>
                      <span className="badge">{c.status}</span>
                    </td>
                    <td>
                      <div className="flex gap-4">
                        <button className="text-brand" onClick={() => edit(c)}>
                          Edit
                        </button>
                        <button
                          className="text-red-600"
                          onClick={async () => {
                            if (
                              !confirm(
                                `Delete ${c.businessName}? This permanently removes the listing and reviews.`,
                              )
                            )
                              return;
                            try {
                              await api(`/admin/creator/${c._id}`, {
                                method: "DELETE",
                              });
                              await reload();
                            } catch (e) {
                              setMessage(
                                e instanceof Error
                                  ? e.message
                                  : "Delete failed.",
                              );
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {data?.length === 0 && (
            <p className="muted py-8">
              No creators yet. Add your first listing.
            </p>
          )}
        </div>
      </div>
      <dialog ref={dialog}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="display text-3xl">
            {selected._id ? "Edit creator" : "A new creative story"}
          </h2>
          <button
            aria-label="Close creator editor"
            className="p-3"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <CreatorEditor
          key={editorVersion}
          creator={selected}
          services={services || []}
          onSaved={() => {
            dialog.current?.close();
            void reload();
          }}
        />
      </dialog>
    </>
  );
}
