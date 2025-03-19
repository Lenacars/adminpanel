import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import AdminSidebar from "./components/admin-sidebar"
import AdminHeader from "./components/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth kontrolünü şimdilik kaldıralım

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}

