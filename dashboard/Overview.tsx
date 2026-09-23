"use client";
import Link from "next/link";
import {
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiHeart,
  FiArrowUpRight,
} from "react-icons/fi";
import { useResource } from "@/hooks/useResource";
import PageHeading from "@/components/PageHeading";
import ResourceState from "@/components/ResourceState";
type Dashboard = {
  creators: number;
  users: number;
  inquiries: number;
  completed: number;
  bookings: number;
  recent: {
    _id: string;
    name: string;
    creator?: { businessName: string };
    date?: string;
    status: string;
  }[];
};
export default function Overview() {
  const { data, error, loading, reload } =
    useResource<Dashboard>("/admin/dashboard");
  const metrics = useResource<Record<string, number>>("/admin/marketplace/metrics");
  return (
    <>
      <PageHeading
        title="A little overview. A lot of possibility."
        description="A live look at the people and moments bringing Memooria to life."
        action={
          <Link href="/creators" className="btn">
            Manage creators <FiArrowUpRight />
          </Link>
        }
      />
      <ResourceState {...{ loading, error, reload }} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 mb-6">{Object.entries(metrics.data || {}).map(([key,value]) => <div className="panel" key={key}><p className="muted text-xs capitalize">{key.replace(/([A-Z])/g," $1")}</p><p className="display text-3xl mb-0">{value}</p></div>)}</div>
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { name: "Total creators", value: data.creators, icon: FiUsers },
              { name: "Community members", value: data.users, icon: FiHeart },
              {
                name: "Total inquiries",
                value: data.inquiries,
                icon: FiMessageSquare,
              },
              {
                name: "Total bookings",
                value: data.bookings,
                icon: FiCalendar,
              },
            ].map((s) => (
              <div key={s.name} className="panel">
                <div className="flex items-center justify-between">
                  <span className="muted text-xs">{s.name}</span>
                  <s.icon className="text-brand" size={18} />
                </div>
                <p className="display mb-2 mt-5 text-4xl">{s.value}</p>
                <span className="text-[10px] muted">
                  {s.name === "Total bookings"
                    ? "Online booking is not enabled"
                    : "Across your marketplace"}
                </span>
              </div>
            ))}
          </div>
          <section className="panel mt-7">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="display text-2xl">The latest conversations</h2>
              <Link href="/inquiries" className="text-xs text-brand">
                View all inquiries ↗
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Creator</th>
                    <th>Event date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((r) => (
                    <tr key={r._id}>
                      <td className="font-semibold">{r.name}</td>
                      <td>{r.creator?.businessName || "General inquiry"}</td>
                      <td>{r.date || "—"}</td>
                      <td>
                        <span className="badge">{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.recent.length && (
                <p className="muted py-10 text-center">
                  Your first conversation is just around the corner.
                </p>
              )}
            </div>
          </section>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <div className="panel !bg-[#eee6f7]">
              <p className="text-xs text-brand">
                YOUR COMMUNITY, GROWING TOGETHER
              </p>
              <h2 className="display text-3xl">Make room for more talent.</h2>
              <p className="muted text-xs leading-6">
                A thoughtful listing helps the right people find each other. Add
                a creator, curate their portfolio, and share their story.
              </p>
              <Link href="/creators" className="btn mt-3">
                Manage your creators ↗
              </Link>
            </div>
            <div className="panel">
              <h2 className="display text-2xl">Keep the details beautiful.</h2>
              <div className="mt-5 space-y-5 text-sm">
                <Link className="block" href="/reviews">
                  Review customer feedback{" "}
                  <span className="float-right">↗</span>
                </Link>
                <Link className="block" href="/services">
                  Curate service categories{" "}
                  <span className="float-right">↗</span>
                </Link>
                <Link className="block" href="/content">
                  Refresh homepage photography{" "}
                  <span className="float-right">↗</span>
                </Link>
              </div>
              <p className="muted mt-7 text-xs">
                {data.completed} inquiries completed so far.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
