import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Memooria Admin",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Grammarly can inject body attributes before React hydrates. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
