"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function UploadCSV() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setMessage("Lütfen bir CSV dosyası seçin")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Bir hata oluştu")
      }

      setMessage(result.message)
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 2000)
    } catch (error: any) {
      setMessage(`Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">CSV Dosyası Yükle</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">CSV Dosyası</label>
          <input type="file" accept=".csv" onChange={handleFileChange} className="w-full p-2 border rounded" required />
          <p className="text-sm text-gray-500 mt-1">
            CSV dosyanızın ilk satırı, tablonuzdaki sütun adlarıyla eşleşmelidir.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "Yükle"}
        </button>

        {message && (
          <div
            className={`p-3 rounded ${message.includes("Hata") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

