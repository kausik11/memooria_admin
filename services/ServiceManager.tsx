"use client";
import { useState, type FormEvent } from "react";
import type { Service } from "@/services/types";
import { useResource } from "@/hooks/useResource";
import { api } from "@/services/api";
import ImageField from "@/components/ImageField";
import PageHeading from "@/components/PageHeading";
import ResourceState from "@/components/ResourceState";
const empty: Service = {
  _id: "",
  title: "",
  slug: "",
  description: "",
  image: "",
  kind: "category",
};
export default function ServiceManager() {
  const { data, error, loading, reload } = useResource<Service[]>("/services");
  const [item, setItem] = useState(empty);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api(`/admin/services${item._id ? `/${item._id}` : ""}`, {
        method: item._id ? "PUT" : "POST",
        body: JSON.stringify(item),
      });
      setItem(empty);
      await reload();
      setMessage("Service saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="Every detail, beautifully covered."
        description="Manage the categories and services customers can discover."
      />
      <ResourceState {...{ loading, error, reload }} />
      <div className="grid items-start gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="panel overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((s) => (
                <tr key={s._id}>
                  <td>
                    <b>{s.title}</b>
                    <p className="muted mt-2 max-w-xs text-[11px]">
                      {s.description}
                    </p>
                  </td>
                  <td>{s.kind}</td>
                  <td>
                    <div className="flex gap-3">
                      <button
                        className="text-brand"
                        onClick={() => {
                          setItem(s);
                          setMessage("");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600"
                        onClick={async () => {
                          if (!confirm(`Delete ${s.title}?`)) return;
                          try {
                            await api(`/admin/services/${s._id}`, {
                              method: "DELETE",
                            });
                            await reload();
                          } catch (e) {
                            setMessage(
                              e instanceof Error ? e.message : "Delete failed.",
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
        </div>
        <form className="panel grid gap-4" onSubmit={save}>
          <h2 className="display text-2xl">
            {item._id ? "Edit service" : "Add a service"}
          </h2>
          {(["title", "slug"] as const).map((k) => (
            <label className="field capitalize" key={k}>
              {k}
              <input
                required
                value={item[k]}
                onChange={(e) => setItem({ ...item, [k]: e.target.value })}
              />
            </label>
          ))}
          <label className="field">
            Type
            <select
              value={item.kind}
              onChange={(e) =>
                setItem({ ...item, kind: e.target.value as Service["kind"] })
              }
            >
              <option value="category">Category</option>
              <option value="service">Service</option>
            </select>
          </label>
          <label className="field">
            Description
            <textarea
              required
              value={item.description}
              onChange={(e) =>
                setItem({ ...item, description: e.target.value })
              }
            />
          </label>
          <ImageField
            label="Image"
            value={item.image}
            onChange={(image) => setItem({ ...item, image })}
          />
          {message && (
            <p role="status" className="text-xs text-brand">
              {message}
            </p>
          )}
          <div className="flex gap-3">
            <button disabled={busy} className="btn">
              {busy ? "Saving…" : "Save service"}
            </button>
            {item._id && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setItem(empty)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
