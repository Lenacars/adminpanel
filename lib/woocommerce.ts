// WooCommerce API ile iletişim kurmak için yardımcı fonksiyonlar

// API URL'leri ve kimlik bilgileri
const WOO_URL = process.env.WOO_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL
const WC_CONSUMER_KEY =
  process.env.WC_CONSUMER_KEY || process.env.WOO_CONSUMER_KEY || process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY
const WC_CONSUMER_SECRET =
  process.env.WC_CONSUMER_SECRET || process.env.WOO_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET
const WC_API_URL = process.env.WC_API_URL || `${WOO_URL}/wp-json/wc/v3`

// WooCommerce API'den veri çekmek için temel fonksiyon
export async function fetchFromWooCommerce(endpoint: string, params: Record<string, string> = {}) {
  // API URL'ini oluştur
  const url = new URL(`${WC_API_URL}/${endpoint}`)

  // Kimlik bilgilerini ekle
  url.searchParams.append("consumer_key", WC_CONSUMER_KEY || "")
  url.searchParams.append("consumer_secret", WC_CONSUMER_SECRET || "")

  // Diğer parametreleri ekle
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  try {
    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("WooCommerce API hatası:", error)
    throw error
  }
}

// Ürünleri getir
export async function getProducts(page = 1, perPage = 10, search = "") {
  const params: Record<string, string> = {
    page: page.toString(),
    per_page: perPage.toString(),
  }

  if (search) {
    params.search = search
  }

  return fetchFromWooCommerce("products", params)
}

// Tek bir ürünü getir
export async function getProduct(id: number) {
  return fetchFromWooCommerce(`products/${id}`)
}

// Ürün kategorilerini getir
export async function getProductCategories() {
  return fetchFromWooCommerce("products/categories", { per_page: "100" })
}

// Ürün etiketlerini getir
export async function getProductTags() {
  return fetchFromWooCommerce("products/tags", { per_page: "100" })
}

