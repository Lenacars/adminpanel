"use server"

import { revalidatePath } from "next/cache"

// WooCommerce API URL'leri ve kimlik bilgileri
const WOO_URL = process.env.WOO_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL
const WC_CONSUMER_KEY =
  process.env.WC_CONSUMER_KEY || process.env.WOO_CONSUMER_KEY || process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY
const WC_CONSUMER_SECRET =
  process.env.WC_CONSUMER_SECRET || process.env.WOO_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET
const WC_API_URL = process.env.WC_API_URL || `${WOO_URL}/wp-json/wc/v3`

// Ürün silme işlemi
export async function deleteProduct(productId: number) {
  try {
    // API URL'ini oluştur
    const url = new URL(`${WC_API_URL}/products/${productId}`)

    // Kimlik bilgilerini ekle
    url.searchParams.append("consumer_key", WC_CONSUMER_KEY || "")
    url.searchParams.append("consumer_secret", WC_CONSUMER_SECRET || "")
    url.searchParams.append("force", "true") // Kalıcı olarak sil

    // API isteği gönder
    const response = await fetch(url.toString(), {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API hatası: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    // Önbelleği temizle ve sayfaları yeniden oluştur
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Ürün silme hatası:", error)
    throw error
  }
}

