"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Sayfa hatası:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white text-black">
      <div className="w-full max-w-md p-8 bg-red-50 rounded-lg shadow-md border border-red-200">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Bir şeyler yanlış gitti!</h2>
        <p className="mb-4 text-gray-700">Hata: {error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}

