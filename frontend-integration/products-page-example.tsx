/**
 * LenaCars Frontend için Örnek Ürünler Sayfası
 * Bu dosyayı frontend projenize referans olarak kullanın
 */

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getProducts, getCategories, getProductsByCategory } from "../lib/api" // API istemcisinin yolunu ayarlayın

// Ürün tipi
interface Product {
  id: number
  name: string
  price: string
  regular_price: string
  sale_price: string
  images: { src: string }[]
  categories: { id: number; name: string }[]
  stock_status: string
}

// Kategori tipi
interface Category {
  id: number
  name: string
  count: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [perPage] = useState(12)

  // Ürünleri yükle
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        // Kategorileri ve ürünleri paralel olarak yükle
        const [productsData, categoriesData] = await Promise.all([
          selectedCategory
            ? getProductsByCategory(selectedCategory, page, perPage)
            : getProducts(page, perPage, searchTerm),
          getCategories(),
        ])

        setProducts(productsData)
        setCategories(categoriesData)
      } catch (err) {
        setError("Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
        console.error("Veri yükleme hatası:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [page, perPage, selectedCategory, searchTerm])

  // Arama işlevi
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Aramada sayfa 1'e dön
  }

  // Kategori değiştirme işlevi
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setPage(1) // Kategori değiştiğinde sayfa 1'e dön
  }

  // Fiyat formatla
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(Number.parseFloat(price))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Araçlarımız</h1>

      {/* Arama ve Filtreleme */}
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Araç ara..."
            className="px-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Ara
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto">
          <button
            className={`px-4 py-2 rounded-md ${selectedCategory === null ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => handleCategoryChange(null)}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-md ${selectedCategory === category.id ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      {/* Yükleniyor */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Ürün Listesi */}
      {!loading && products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Araç bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={product.images[0]?.src || "/placeholder.svg?height=200&width=300"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                    {product.regular_price && product.sale_price && product.regular_price !== product.sale_price && (
                      <p className="text-sm text-gray-500 line-through">{formatPrice(product.regular_price)}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.stock_status === "instock" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock_status === "instock" ? "Müsait" : "Satıldı"}
                  </span>
                </div>
                <div className="mt-4">
                  <a
                    href={`/products/${product.id}`}
                    className="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Detayları Gör
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sayfalama */}
      {!loading && products.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 mr-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Önceki
          </button>
          <span className="px-4 py-2">Sayfa {page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={products.length < perPage}
            className="px-4 py-2 ml-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}

