"use server"

import { revalidatePath } from "next/cache"

// WooCommerce API URL'leri ve kimlik bilgileri
const WOO_URL = process.env.WOO_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL
const WC_CONSUMER_KEY =
  process.env.WC_CONSUMER_KEY || process.env.WOO_CONSUMER_KEY || process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY
const WC_CONSUMER_SECRET =
  process.env.WC_CONSUMER_SECRET || process.env.WOO_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET
const WC_API_URL = process.env.WC_API_URL || `${WOO_URL}/wp-json/wc/v3`

// Ürün güncelleme işlemi
export async function updateProduct(productId: number, productData: any) {
  try {
    // API URL'ini oluştur
    const url = new URL(`${WC_API_URL}/products/${productId}`)

    // Kimlik bilgilerini ekle
    url.searchParams.append("consumer_key", WC_CONSUMER_KEY || "")
    url.searchParams.append("consumer_secret", WC_CONSUMER_SECRET || "")

    // Kategori verilerini düzenle
    const formattedData = {
      ...productData,
      categories: productData.categories.map((id: number) => ({ id })),
    }

    // API isteği gönder
    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API hatası: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const updatedProduct = await response.json()

    // Önbelleği temizle ve sayfaları yeniden oluştur
    revalidatePath("/products")
    revalidatePath(`/products/${productId}`)

    return updatedProduct
  } catch (error) {
    console.error("Ürün güncelleme hatası:", error)
    throw error
  }
}

