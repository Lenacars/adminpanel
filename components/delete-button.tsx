"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeleteButton({ id }: { id: number }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Bu kaydı silmek istediğinizden emin misiniz?")) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/delete/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Silme işlemi başarısız oldu")
      }

      // Sayfayı yenile
      router.refresh()
    } catch (error) {
      console.error("Silme hatası:", error)
      alert("Silme işlemi sırasında bir hata oluştu")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:underline disabled:opacity-50">
      {isDeleting ? "Siliniyor..." : "Sil"}
    </button>
  )
}

