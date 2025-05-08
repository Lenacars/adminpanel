import Link from "next/link"

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          LenaCars
        </Link>

        <div className="space-x-4">
          <Link href="/" className="hover:text-gray-300">
            Dashboard
          </Link>
          <Link href="/araclar" className="hover:text-gray-300">
            Araçlar
          </Link>
          <Link href="/upload" className="hover:text-gray-300">
            CSV Yükle
          </Link>
        </div>
      </div>
    </nav>
  )
}

