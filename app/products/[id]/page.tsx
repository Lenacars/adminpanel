import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getProduct } from "@/lib/woocommerce"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Tag, Package, DollarSign, BarChart2 } from "lucide-react"

export const dynamic = "force-dynamic" // Her istekte yeniden oluştur

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = Number.parseInt(params.id)

  if (isNaN(productId)) {
    notFound()
  }

  let product
  try {
    product = await getProduct(productId)
  } catch (error) {
    console.error("Ürün getirme hatası:", error)
    notFound()
  }

  if (!product) {
    notFound()
  }

  // HTML içeriğini güvenli bir şekilde render et
  function createMarkup(html: string) {
    return { __html: html }
  }

  // Fiyatı formatla
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(Number.parseFloat(price))
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Geri</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="ml-auto">
          <Button asChild>
            <Link href={`/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ürün Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                {product.images && product.images.length > 0 ? (
                  <div className="relative aspect-square overflow-hidden rounded-lg border">
                    <Image
                      src={product.images[0].src || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}

                {product.images && product.images.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {product.images.slice(1, 5).map((image: any) => (
                      <div key={image.id} className="relative aspect-square overflow-hidden rounded-md border">
                        <Image src={image.src || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">SKU</h3>
                  <p>{product.sku || "Belirtilmemiş"}</p>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Fiyat</h3>
                  <p className="text-xl font-bold">{formatPrice(product.price)}</p>
                  {product.regular_price && product.sale_price && product.regular_price !== product.sale_price && (
                    <p className="text-sm">
                      <span className="line-through text-muted-foreground">{formatPrice(product.regular_price)}</span>{" "}
                      indirimli fiyat
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Stok Durumu</h3>
                  {product.stock_status === "instock" ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Stokta
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Tükendi
                    </span>
                  )}
                  {product.stock_quantity !== null && <p className="text-sm mt-1">{product.stock_quantity} adet</p>}
                </div>

                {product.categories && product.categories.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Kategoriler</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {product.categories.map((category: any) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Etiketler</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {product.tags.map((tag: any) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ürün Açıklaması</CardTitle>
            </CardHeader>
            <CardContent>
              {product.description ? (
                <div className="prose max-w-none" dangerouslySetInnerHTML={createMarkup(product.description)} />
              ) : (
                <p className="text-muted-foreground">Bu ürün için açıklama bulunmuyor.</p>
              )}
            </CardContent>
          </Card>

          {product.attributes && product.attributes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Özellikler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {product.attributes.map((attr: any) => (
                    <div key={attr.id} className="space-y-1">
                      <h3 className="font-medium text-sm">{attr.name}</h3>
                      <p>{attr.options.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Satış Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-blue-100 p-2">
                  <Tag className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium">Satış Fiyatı</p>
                  <p className="text-2xl font-bold">{formatPrice(product.price)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-green-100 p-2">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium">Toplam Satış</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-purple-100 p-2">
                  <BarChart2 className="h-4 w-4 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium">Görüntülenme</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <Link href={`/products/${product.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Ürünü Düzenle
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                Stok Güncelle
              </Button>
              <Button variant="outline" className="w-full">
                Fiyat Güncelle
              </Button>
              <Button variant="destructive" className="w-full">
                Ürünü Sil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

