"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Arac {
  id: number
  // Tablonuzdaki diğer alanları buraya ekleyin
  [key: string]: any
}

export default function EditForm({ arac }: { arac: Arac }) {
  const router = useRouter()
  const [formData, setFormData] = useState(arac)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/update/${arac.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Güncelleme başarısız oldu")
      }

      // Ana sayfaya yönlendir
      router.push("/")
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Formdan hariç tutulacak alanlar
  const excludeFields = ["id", "created_at", "updated_at"]

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {Object.keys(formData)
        .filter((key) => !excludeFields.includes(key))
        .map((key) => (
          <div key={key}>
            <label className="block mb-1 capitalize">{key.replace(/_/g, " ")}</label>
            <input
              type="text"
              name={key}
              value={formData[key] || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}

      {error && <div className="p-3 rounded bg-red-100 text-red-700">{error}</div>}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          İptal
        </button>
      </div>
    </form>
  )
}

