import type React from "react";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { cookies } from "next/headers"; // Bu Next.js 15 uyumlu!

export const metadata = {
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR sırasında pathname'i alamayız. Çözüm: Sidebar'ın kendi içinde handle etmesi.
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen">{children}</main>
        </div>
      </body>
    </html>
  );
}
