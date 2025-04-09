/**
 * LenaCars Frontend için Örnek Ürün Detay Sayfası
 * Bu dosyayı frontend projenize referans olarak kullanın
 */

"use client"

import { useState, useEffect } from "react"
import { getProduct } from "../lib/api" // API istemcisinin yolunu ayarlayın

// Ürün tipi
interface Product {
  id: number
  name: string
  description: string
  price: string
  regular_price: string
  sale_price: string
  images: { src: string }[]
  categories: { id: number; name: string }[]
  attributes: { name: string; options: string[] }[]
  stock_status: string
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      setError(null)

      try {
        const productData = await getProduct(params.id)
        setProduct(productData)
      } catch (err) {
        setError("Ürün bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
        console.error("Ürün yükleme hatası:", err)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  // Fiyat formatla
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(Number.parseFloat(price))
  }

  // HTML içeriğini güvenli bir şekilde render et
  function createMarkup(html: string) {
    return { __html: html }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error || "Ürün bulunamadı."}
        </div>
        <a href="/products" className="text-blue-600 hover:underline">
          ← Tüm araçlara dön
        </a>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <a href="/products" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Tüm araçlara dön
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Ürün Görselleri */}
        <div className="space-y-4">
          <div className="relative h-96 rounded-lg overflow-hidden border">
            <img
              src={product.images[activeImage]?.src || "/placeholder.svg?height=400&width=600"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative h-24 rounded-md overflow-hidden border cursor-pointer ${
                    activeImage === index ? "ring-2 ring-blue-600" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt={`${product.name} - Görsel ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2">
              {product.categories.map((category) => (
                <span key={category.id} className="mr-2 px-3 py-1 bg-gray-200 rounded-full text-sm">
                  {category.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</p>
              {product.regular_price && product.sale_price && product.regular_price !== product.sale_price && (
                <p className="ml-2 text-lg text-gray-500 line-through">{formatPrice(product.regular_price)}</p>
              )}
            </div>

            <span
              className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
                product.stock_status === "instock" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {product.stock_status === "instock" ? "Müsait" : "Satıldı"}
            </span>
          </div>

          {/* Ürün Özellikleri */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Araç Özellikleri</h2>
              <div className="grid grid-cols-2 gap-4">
                {product.attributes.map((attr) => (
                  <div key={attr.name} className="space-y-1">
                    <p className="text-sm text-gray-500">{attr.name}</p>
                    <p className="font-medium">{attr.options.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* İletişim Butonu */}
          <div className="pt-4">
            <a
              href="/contact"
              className="block w-full text-center py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              İletişime Geç
            </a>
          </div>
        </div>
      </div>

      {/* Ürün Açıklaması */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Araç Hakkında</h2>
        <div className="prose max-w-none" dangerouslySetInnerHTML={createMarkup(product.description)} />
      </div>
    </div>
  )
}

