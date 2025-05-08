export default function EnvDebugPage() {
  // Tüm olası çevre değişkeni isimlerini kontrol et
  const envVarPrefixes = ["", "NEXT_PUBLIC_", "STORAGE_", "MY_STORAGE_"]
  const envVarNames = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "POSTGRES_URL"]

  const allEnvVars = []

  // Tüm olası kombinasyonları kontrol et
  for (const prefix of envVarPrefixes) {
    for (const name of envVarNames) {
      const fullName = `${prefix}${name}`
      allEnvVars.push({
        name: fullName,
        exists: typeof process.env[fullName] !== "undefined",
        value: process.env[fullName] ? `${process.env[fullName].substring(0, 10)}...` : "Yok",
      })
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Çevre Değişkenleri Detaylı Kontrol</h1>

      <div className="space-y-4">
        {allEnvVars.map((env, index) => (
          <div key={index} className={`p-4 border rounded ${env.exists ? "bg-green-50" : "bg-gray-50"}`}>
            <h2 className="font-bold">{env.name}</h2>
            <p>{env.exists ? "Ayarlanmış ✅" : "Ayarlanmamış ❌"}</p>
            {env.exists && <p className="text-sm text-gray-500 mt-1">Değer: {env.value}</p>}
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

