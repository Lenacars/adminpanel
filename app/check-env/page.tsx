export default function CheckEnvPage() {
  // Tüm olası çevre değişkeni isimlerini kontrol et
  const envVars = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { name: "STORAGE_SUPABASE_URL", value: process.env.STORAGE_SUPABASE_URL },
    { name: "STORAGE_SUPABASE_ANON_KEY", value: process.env.STORAGE_SUPABASE_ANON_KEY },
    { name: "POSTGRES_URL", value: process.env.POSTGRES_URL },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Çevre Değişkenleri Kontrolü</h1>

      <div className="space-y-4">
        {envVars.map((env, index) => (
          <div key={index} className="p-4 border rounded">
            <h2 className="font-bold">{env.name}</h2>
            <p>{env.value ? "Ayarlanmış ✅" : "Ayarlanmamış ❌"}</p>
            {env.value && <p className="text-sm text-gray-500 mt-1">Değer: {env.value.substring(0, 10)}...</p>}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Ana Sayfaya Dön
        </a>
      </div>
    </div>
  )
}

