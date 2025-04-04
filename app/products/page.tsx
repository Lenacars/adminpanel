import { Suspense } from "react"
import { getProducts, getProductCategories } from "@/lib/woocommerce"
import ProductsTable from "./products-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic" // Her istekte yeniden oluştur

export default async function ProductsPage() {
  // Ürünleri ve kategorileri paralel olarak getir
  const [productsData, categoriesData] = await Promise.all([
    getProducts().catch((error) => {
      console.error("Ürünler getirilirken hata oluştu:", error)
      return { products: [] }
    }),
    getProductCategories().catch((error) => {
      console.error("Kategoriler getirilirken hata oluştu:", error)
      return []
    }),
  ])

  // Kategori ID'lerini isimlere eşleyen bir harita oluştur
  const categoryMap = new Map()
  if (Array.isArray(categoriesData)) {
    categoriesData.forEach((category: any) => {
      categoryMap.set(category.id, category.name)
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ürünler</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Toplam Ürünler</CardTitle>
            <CardDescription>Sistemdeki tüm ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Array.isArray(productsData) ? productsData.length : "Yükleniyor..."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Aktif Ürünler</CardTitle>
            <CardDescription>Satışta olan ürünler</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Array.isArray(productsData)
                ? productsData.filter((product: any) => product.status === "publish").length
                : "Yükleniyor..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Kategoriler</CardTitle>
            <CardDescription>Toplam ürün kategorileri</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Array.isArray(categoriesData) ? categoriesData.length : "Yükleniyor..."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Listesi</CardTitle>
          <CardDescription>WooCommerce'den alınan tüm ürünlerin listesi</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ProductsTableSkeleton />}>
            <ProductsTable initialProducts={productsData} categoryMap={categoryMap} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="border rounded-md">
        <div className="h-12 px-4 border-b flex items-center bg-muted/50">
          <Skeleton className="h-4 w-[30%]" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 px-4 border-b flex items-center">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[70px]" />
      </div>
    </div>
  )
}

