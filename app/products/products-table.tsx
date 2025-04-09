"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { getProducts } from "@/lib/woocommerce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, Edit, Eye } from "lucide-react"
import DeleteProductButton from "./delete-product-button"

interface ProductsTableProps {
  initialProducts: any[]
  categoryMap: Map<number, string>
}

export default function ProductsTable({ initialProducts, categoryMap }: ProductsTableProps) {
  const [products, setProducts] = useState<any[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Arama işlevi
  const handleSearch = async () => {
    setLoading(true)
    try {
      const data = await getProducts(1, perPage, searchTerm)
      setProducts(data || [])
      setPage(1)
    } catch (error) {
      console.error("Arama hatası:", error)
    } finally {
      setLoading(false)
    }
  }

  // Sayfa değiştirme işlevi
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1) return

    setLoading(true)
    try {
      const data = await getProducts(newPage, perPage, searchTerm)
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data)
        setPage(newPage)
      } else if (newPage > 1) {
        // Eğer sonuç yoksa ve sayfa 1'den büyükse, önceki sayfaya dön
        setPage(newPage - 1)
      }
    } catch (error) {
      console.error("Sayfa değiştirme hatası:", error)
    } finally {
      setLoading(false)
    }
  }

  // Sayfa başına ürün sayısını değiştirme işlevi
  const handlePerPageChange = async (value: string) => {
    const newPerPage = Number.parseInt(value)
    setLoading(true)
    try {
      const data = await getProducts(1, newPerPage, searchTerm)
      setProducts(data || [])
      setPerPage(newPerPage)
      setPage(1)
    } catch (error) {
      console.error("Sayfa başına ürün değiştirme hatası:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fiyatı formatla
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(Number.parseFloat(price))
  }

  // Kategori isimlerini al
  const getCategoryNames = (categories: any[]) => {
    if (!categories || !Array.isArray(categories)) return ""

    return categories
      .map((cat) => categoryMap.get(cat.id) || cat.name || "")
      .filter(Boolean)
      .join(", ")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Ürün ara..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Aranıyor..." : "Ara"}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/products/new">Yeni Ürün Ekle</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Görsel</TableHead>
              <TableHead>Ürün Adı</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {loading ? "Ürünler yükleniyor..." : "Ürün bulunamadı."}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images && product.images[0] ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-md">
                        <Image
                          src={product.images[0].src || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Yok</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || "-"}</TableCell>
                  <TableCell>{getCategoryNames(product.categories)}</TableCell>
                  <TableCell>{product.price ? formatPrice(product.price) : "-"}</TableCell>
                  <TableCell>
                    {product.stock_status === "instock" ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Stokta
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Tükendi
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/products/${product.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Görüntüle</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Düzenle</span>
                        </Link>
                      </Button>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Sayfa başına gösterim</p>
          <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={perPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Önceki Sayfa</span>
          </Button>
          <p className="text-sm">
            Sayfa <span className="font-medium">{page}</span>
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page + 1)}
            disabled={products.length < perPage || loading}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Sonraki Sayfa</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

