import { getProductCategories } from "@/lib/woocommerce"
import NewProductForm from "./new-product-form"

export const dynamic = "force-dynamic" // Her istekte yeniden oluştur

export default async function NewProductPage() {
  try {
    // Kategorileri getir
    const categories = await getProductCategories()

    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Yeni Ürün Ekle</h1>
        <NewProductForm categories={categories} />
      </div>
    )
  } catch (error) {
    console.error("Kategorileri getirme hatası:", error)
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Yeni Ürün Ekle</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Kategoriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
        </div>
      </div>
    )
  }
}

