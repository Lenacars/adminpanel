"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart, FileText, Home, Package, Settings, ShoppingCart, Users } from "lucide-react"

const sidebarItems = [
  {
    title: "Ana Sayfa",
    href: "/",
    icon: Home,
  },
  {
    title: "Ürünler",
    href: "/products",
    icon: Package,
  },
  {
    title: "Kullanıcılar",
    href: "/users",
    icon: Users,
  },
  {
    title: "Siparişler",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Raporlar",
    href: "/reports",
    icon: BarChart,
  },
  {
    title: "Belgeler",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex flex-col gap-2 p-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  )
}

