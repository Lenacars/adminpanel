import { supabase } from "@/lib/supabase"

export default async function Home() {
  // Supabase'den verileri çek
  const { data, error } = await supabase.from("Araclar").select("*").limit(100)

  if (error) {
    return <div>Veri çekilirken bir hata oluştu</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Araçlar Listesi</h1>

      {data && data.length > 0 ? (
        <div>
          {data.map((arac, index) => (
            <div key={index} className="border p-4 mb-4 rounded">
              <pre>{JSON.stringify(arac, null, 2)}</pre>
            </div>
          ))}
        </div>
      ) : (
        <p>Henüz kayıtlı araç bulunmamaktadır.</p>
      )}

      <div className="mt-4">
        <a href="/upload" className="bg-green-500 text-white py-2 px-4 rounded">
          CSV Yükle
        </a>
      </div>
    </div>
  )
}

