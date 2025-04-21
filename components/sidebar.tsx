import Link from "next/link"

export default function Sidebar() {
  return (
    <div className="h-screen bg-gray-100 w-64 p-4">
      <div className="flex items-center mb-6">
        <h1 className="text-xl font-bold mr-2">LenaCars</h1>
        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Admin</span>
      </div>

      <nav className="space-y-1">
        <Link href="/" className="flex items-center p-3 rounded hover:bg-gray-200">
          <span className="mr-3">📊</span>
          Dashboard
        </Link>

        <Link href="/products" className="flex items-center p-3 rounded hover:bg-gray-200">
          <span className="mr-3">🚗</span>
          Araçlar
        </Link>

        <Link href="/kullanicilar" className="flex items-center p-3 rounded hover:bg-gray-200">
          <span className="mr-3">👤</span>
          Kullanıcılar
        </Link>

        <Link href="/siparisler" className="flex items-center p-3 rounded hover:bg-gray-200">
          <span className="mr-3">🛒</span>
          Siparişler
        </Link>

        <Link href="/icerik-yonetimi" className="flex items-center p-3 rounded hover:bg-gray-200">
          <span className="mr-3">📄</span>
          İçerik Yönetimi
        </Link>

        <Link href="/analitik" className="flex items-center p-3 rounded hover:bg-gray-200">
          <span className="mr-3">📈</span>
          Analitik
        </Link>

        <Link href="/mesajlar" className="flex items-center p-3 rounded hover:bg-gray-200">
          <span className="mr-3">💬</span>
          Mesajlar
        </Link>

        <Link href="/ayarlar" className="flex items-center p-3 rounded hover:bg-gray-200">
          <span className="mr-3">⚙️</span>
          Ayarlar
        </Link>

        <Link href="/media" className="flex items-center p-3 rounded hover:bg-gray-200">
          <span className="mr-3">🖼️</span>
          Ortam Kütüphanesi
        </Link>

        <Link href="/upload" className="flex items-center p-3 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
          <span className="mr-3">📄</span>
          CSV Yükle
        </Link>
      </nav>
    </div>
  )
}
