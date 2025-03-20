import { checkSupabaseConnection } from "@/lib/supabase"

export default async function Home() {
  // Supabase bağlantısını kontrol et
  const connectionStatus = await checkSupabaseConnection()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className={`p-4 rounded mb-6 ${connectionStatus.connected ? "bg-green-100" : "bg-red-100"}`}>
        <h2 className="font-bold">Supabase Bağlantı Durumu</h2>
        <p>{connectionStatus.message}</p>

        <div className="mt-2 text-sm">
          <p>Supabase URL: {connectionStatus.url}</p>
          <p>Supabase Anahtar: {connectionStatus.keyExists ? "Mevcut" : "Eksik"}</p>

          {connectionStatus.envVars && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Çevre Değişkenleri</h3>
              {Object.entries(connectionStatus.envVars).map(([key, value]) => (
                <p key={key}>
                  {key}: {value}
                </p>
              ))}
            </div>
          )}

          {connectionStatus.error && (
            <div className="mt-4 p-4 bg-red-50 rounded">
              <h3 className="font-bold mb-2">Hata Detayı</h3>
              <p>{connectionStatus.error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <a href="/upload" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          CSV Yükle
        </a>
      </div>
    </div>
  )
}

