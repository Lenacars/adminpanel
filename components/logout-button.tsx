"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    setLoading(true)

    // Admin oturumunu sonlandır
    document.cookie = "adminAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Login sayfasına yönlendir
    router.push("/login")
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
      className="text-red-500 hover:text-red-700 hover:bg-red-100"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {loading ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
    </Button>
  )
}

