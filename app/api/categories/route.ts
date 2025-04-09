import { NextResponse } from "next/server"
import { getProductCategories } from "@/lib/woocommerce"

// Tüm kategorileri getir
export async function GET() {
  try {
    const categories = await getProductCategories()

    return NextResponse.json(categories, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error) {
    console.error("API hatası:", error)
    return NextResponse.json({ error: "Kategoriler getirilirken bir hata oluştu" }, { status: 500 })
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

