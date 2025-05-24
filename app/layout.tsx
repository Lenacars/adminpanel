import type React from "react";
import "./globals.css";
import Sidebar from "@/components/sidebar"; // Sidebar'ınızın doğru import edildiğinden emin olun
// import { cookies } from "next/headers"; // Bu satır mevcut kodunuzda var, kullanılıyorsa kalsın.

export const metadata = {
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <div className="flex"> {/* Bu ana sarmalayıcı div */}
          <Sidebar /> {/* Sabitlenmiş Sidebar'ınız */}
          
          {/* Ana içerik alanı güncellendi */}
          <main className="flex-1 min-h-screen ml-64">
            {/* Önceki className: "flex-1 min-h-screen"
              Yeni className:   "flex-1 min-h-screen ml-64"
              Eklenen: ml-64 (sidebar genişliği kadar sol boşluk)
            */}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
