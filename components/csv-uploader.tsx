// lenacars projesinde (frontend)
"use client"

import type React from "react"

import { useState } from "react"

// API URL'sini çevre değişkeninden al veya varsayılan değeri kullan
const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://adminpanel-green-two.vercel.app"

export default function CSVUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Lütfen bir CSV dosyası seçin")
      return
    }

    setLoading(true)
    setMessage("")
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_URL}/api/upload-csv`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Sunucu hatası: ${response.status}`)
      }

      setMessage(result.message)
      setFile(null)

      // Form elemanını sıfırla
      const fileInput = document.getElementById("csv-file") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error: any) {
      setError(`Hata: ${error.message}`)
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
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            CSV dosyanızın ilk satırı, tablodaki sütun adlarıyla eşleşmelidir.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "Yükle"}
        </button>

        {message && <div className="p-3 rounded bg-green-100 text-green-700 mt-4">{message}</div>}

        {error && <div className="p-3 rounded bg-red-100 text-red-700 mt-4">{error}</div>}
      </form>
    </div>
  )
}

