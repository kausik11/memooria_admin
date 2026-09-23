"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiGrid,
  FiUsers,
  FiLayers,
  FiMessageSquare,
  FiStar,
  FiLogOut,
  FiArrowUpRight,
  FiImage,
  FiClipboard,
} from "react-icons/fi";
import { api } from "@/services/api";
const nav = [
  ...[["users", "Users & access"], ["requirements", "Requirements"], ["bookings", "Bookings"], ["proposals", "Proposals"], ["verification", "Verification"], ["appeals", "Appeals"], ["disputes", "Disputes"], ["messages", "Messages"], ["categories", "Categories"], ["event-types", "Event types"], ["forms", "Dynamic forms"], ["settings", "Settings"], ["audit-logs", "Audit logs"]].map(([path,label]) => ({href: "/"+path, label, icon: FiLayers})),
  { href: "/dashboard", label: "Overview", icon: FiGrid },
  { href: "/creators", label: "Creators", icon: FiUsers },
  { href: "/onboarding", label: "Onboarding", icon: FiClipboard },
  { href: "/services", label: "Services", icon: FiLayers },
  { href: "/inquiries", label: "Inquiries", icon: FiMessageSquare },
  { href: "/reviews", label: "Reviews", icon: FiStar },
  { href: "/content", label: "Site content", icon: FiImage },
];
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(),
    router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    api<{ role: string }>("/auth/me")
      .then((u) => {
        if (["admin", "super_admin"].includes(u.role)) setReady(true);
        else router.replace("/login");
      })
      .catch(() => router.replace("/login"));
  }, [router]);
  if (!ready) return <p className="p-12 muted">Checking your session…</p>;
  return (
    <div className="min-h-screen lg:pl-60">
      <aside className="border-b border-[#e7e1ed] bg-white p-5 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col lg:border-r lg:p-7">
        <Link href="/dashboard" className="display text-3xl">
          <span className="text-brand">✳</span> memooria
          <span className="text-brand">.</span>
        </Link>
        <span className="muted ml-9 mt-1 text-[9px] tracking-[.25em]">
          ADMIN WORKSPACE
        </span>
        <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {nav.map((n) => (
            <Link
              href={n.href}
              key={n.href}
              className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-3 text-xs ${pathname === n.href ? "bg-[#f1eafb] font-semibold text-brand" : "muted hover:bg-stone-50"}`}
            >
              <n.icon size={17} />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 space-y-5 lg:mt-auto">
          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 text-xs muted"
          >
            View marketplace <FiArrowUpRight />
          </a>
          <button
            onClick={async () => {
              await api("/auth/logout", { method: "POST" });
              router.replace("/login");
            }}
            className="flex items-center gap-3 text-xs muted"
          >
            <FiLogOut />
            Sign out
          </button>
        </div>
      </aside>
      <header className="flex h-20 items-center justify-between border-b border-[#e7e1ed] bg-white px-6 lg:px-10">
        <span className="text-xs muted">
          Workspace <span className="px-3">/</span>
          <span className="capitalize text-ink">{pathname.slice(1)}</span>
        </span>
        <span className="flex items-center gap-3 text-xs">
          <span className="size-2 rounded-full bg-emerald-500" />
          Administrator
          <span className="flex size-9 items-center justify-center rounded-full bg-[#eee5f7] text-brand">
            M
          </span>
        </span>
      </header>
      <main className="mx-auto max-w-7xl p-5 md:p-10">{children}</main>
    </div>
  );
}
