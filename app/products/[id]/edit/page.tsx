import { notFound } from "next/navigation"
import { getProduct, getProductCategories } from "@/lib/woocommerce"
import ProductEditForm from "./product-edit-form"

export const dynamic = "force-dynamic" // Her istekte yeniden oluştur

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  const productId = Number.parseInt(params.id)

  if (isNaN(productId)) {
    notFound()
  }

  try {
    // Ürün ve kategorileri paralel olarak getir
    const [product, categories] = await Promise.all([getProduct(productId), getProductCategories()])

    if (!product) {
      notFound()
    }

    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Ürün Düzenle: {product.name}</h1>
        <ProductEditForm product={product} categories={categories} />
      </div>
    )
  } catch (error) {
    console.error("Ürün getirme hatası:", error)
    notFound()
  }
}

