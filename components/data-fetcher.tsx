// lenacars projesinde (frontend)
"use client"

import { useState, useEffect } from "react"

// API URL'sini çevre değişkeninden al veya varsayılan değeri kullan
const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://adminpanel-green-two.vercel.app"

export default function DataFetcher() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Backend API'den veri çek
        const response = await fetch(`${API_URL}/api/araclar`)

        if (!response.ok) {
          throw new Error(`API hatası: ${response.status}`)
        }

        const result = await response.json()

        if (result.error) {
          throw new Error(result.error)
        }

        setData(result.data || [])
      } catch (err: any) {
        setError(err.message || "Veri çekilirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Yükleniyor...</div>
  if (error) return <div>Hata: {error}</div>

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Araçlar</h2>
      {data.length === 0 ? (
        <p>Veri bulunamadı</p>
      ) : (
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.id} className="p-3 border rounded">
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

