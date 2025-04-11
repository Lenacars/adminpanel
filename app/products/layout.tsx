// app/products/layout.tsx

import type { ReactNode } from "react"
import Link from "next/link"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Ürün Yönetimi",
  description: "Admin panel ürün düzenleme alanı",
}

export default function ProductLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {/* Sol üstte sabit geri butonu */}
      <Link
        href="/"
        className="fixed top-4 left-4 bg-white text-black px-4 py-2 rounded shadow hover:bg-gray-200 transition z-50"
      >
        ← Anasayfa
      </Link>

      <main className={`pt-16 px-4 ${inter.className}`}>
        {children}
      </main>
    </ThemeProvider>
  )
}
