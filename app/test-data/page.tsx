import { supabase } from "@/lib/supabase"

export default async function TestDataPage() {
  let connectionStatus = { success: false, message: "" }
  let data = null

  try {
    // Basit bir sorgu deneyin
    const { data: testData, error } = await supabase.from("Araclar").select("*").limit(1)

    if (error) {
      connectionStatus = {
        success: false,
        message: `Bağlantı hatası: ${error.message}`,
      }
    } else {
      connectionStatus = {
        success: true,
        message: "Supabase bağlantısı başarılı!",
      }
      data = testData
    }
  } catch (error: any) {
    connectionStatus = {
      success: false,
      message: `Beklenmeyen hata: ${error.message}`,
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Veri Testi</h1>

      <div className={`p-4 rounded mb-6 ${connectionStatus.success ? "bg-green-100" : "bg-red-100"}`}>
        <h2 className="font-bold">Bağlantı Durumu</h2>
        <p>{connectionStatus.message}</p>
      </div>

      {data && (
        <div className="mb-6">
          <h2 className="font-bold mb-2">Veri Örneği</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      <div className="flex gap-4">
        <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Ana Sayfaya Dön
        </a>
        <a href="/env-check" className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
          Çevre Değişkenlerini Kontrol Et
        </a>
      </div>
    </div>
  )
}

