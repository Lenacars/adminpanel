import { type NextRequest, NextResponse } from "next/server"
import { getProducts } from "@/lib/woocommerce"

// Tüm ürünleri getir
export async function GET(request: NextRequest) {
  try {
    // URL parametrelerini al
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("per_page") || "10")
    const search = searchParams.get("search") || ""

    // WooCommerce'den ürünleri getir
    const products = await getProducts(page, perPage, search)

    // CORS başlıklarını ekle
    return NextResponse.json(products, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error) {
    console.error("API hatası:", error)
    return NextResponse.json({ error: "Ürünler getirilirken bir hata oluştu" }, { status: 500 })
  }
}

// CORS için OPTIONS isteğini işle
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  )
}

