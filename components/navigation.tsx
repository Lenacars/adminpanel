"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Ana Sayfa",
    href: "/",
  },
  {
    name: "Ürünler",
    href: "/products",
  },
  {
    name: "Kullanıcılar",
    href: "/users",
  },
  {
    name: "Siparişler",
    href: "/orders",
  },
  {
    name: "Raporlar",
    href: "/reports",
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === item.href ? "text-foreground font-medium" : "text-foreground/60",
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}

