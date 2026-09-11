import AdminShell from "@/components/AdminShell";
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
