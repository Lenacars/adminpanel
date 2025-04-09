/**
 * LenaCars Frontend için API İstemci Kütüphanesi
 * Bu dosyayı frontend projenize kopyalayın (örn: lib/api.ts)
 */

// Backend API'nin URL'si - Vercel'e deploy edildiğinde bu URL'yi güncelleyin
const API_BASE_URL = "https://lena-cars-admin.vercel.app/api"

// API isteği yapmak için yardımcı fonksiyon
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API isteği başarısız: ${url}`, error)
    throw error
  }
}

// Tüm ürünleri getir
export async function getProducts(page = 1, perPage = 10, search = "") {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })

  if (search) {
    queryParams.append("search", search)
  }

  return fetchAPI(`/products?${queryParams.toString()}`)
}

// Belirli bir ürünü getir
export async function getProduct(id: number | string) {
  return fetchAPI(`/products/${id}`)
}

// Tüm kategorileri getir
export async function getCategories() {
  return fetchAPI("/categories")
}

// Kategori bazında ürünleri getir
export async function getProductsByCategory(categoryId: number | string, page = 1, perPage = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    category: categoryId.toString(),
  })

  return fetchAPI(`/products?${queryParams.toString()}`)
}

