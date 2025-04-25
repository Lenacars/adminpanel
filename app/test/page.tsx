export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Sayfası</h1>
      <p className="mt-4">Bu sayfa çalışıyorsa, App Router doğru şekilde yapılandırılmıştır.</p>

      <div className="mt-6">
        <a href="/" className="text-blue-500 hover:underline">
          Ana Sayfaya Dön
        </a>
      </div>
    </div>
  )
}

