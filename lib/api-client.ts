// Bu dosya, frontend projesine kopyalanabilir

// API temel URL'si
const API_BASE_URL = "https://lena-cars-admin.vercel.app/api"

// Ürünleri getir
export async function fetchProducts(page = 1, perPage = 10, search = "") {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })

  if (search) {
    params.append("search", search)
  }

  const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`API hatası: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Belirli bir ürünü getir
export async function fetchProduct(id: number) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`)

  if (!response.ok) {
    throw new Error(`API hatası: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Kategorileri getir
export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`)

  if (!response.ok) {
    throw new Error(`API hatası: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Ürün arama
export async function searchProducts(query: string) {
  return fetchProducts(1, 10, query)
}

// Kategori bazında ürünleri getir
export async function fetchProductsByCategory(categoryId: number, page = 1, perPage = 10) {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    category: categoryId.toString(),
  })

  const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`API hatası: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

