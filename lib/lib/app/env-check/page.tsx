export default function EnvCheckPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Çevre Değişkenleri Kontrolü</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-bold">NEXT_PUBLIC_SUPABASE_URL</h2>
          <p>{process.env.NEXT_PUBLIC_SUPABASE_URL ? "Ayarlanmış ✅" : "Ayarlanmamış ❌"}</p>
          {process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <p className="text-sm text-gray-500 mt-1">
              Değer: {process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...
            </p>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY</h2>
          <p>{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Ayarlanmış ✅" : "Ayarlanmamış ❌"}</p>
          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
            <p className="text-sm text-gray-500 mt-1">
              Değer: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Ana Sayfaya Dön
        </a>
      </div>
    </div>
  )
}

