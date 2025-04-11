"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Papa from "papaparse"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Variation {
  sku?: string
  fuel?: string
  transmission?: string
  color?: string
  status: string
}

interface GroupedProduct {
  name: string
  variations: Variation[]
}

export default function ProductsPage() {
  const [productsData, setProductsData] = useState<GroupedProduct[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/products.csv")
      .then((res) => res.text())
      .then((csvText) => {
        const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        })

        const grouped: Record<string, GroupedProduct> = {}

        result.data.forEach((row: any) => {
          const name = row["İsim"]
          const variation: Variation = {
            sku: row["Stok kodu (SKU)"],
            fuel: row["Nitelik 8 değer(ler)i"],
            transmission: row["Nitelik 3 değer(ler)i"],
            color: row["Nitelik 2 değer(ler)i"],
            status: row["Yayımlanmış"]
          }

          if (!grouped[name]) {
            grouped[name] = {
              name,
              variations: []
            }
          }
          grouped[name].variations.push(variation)
        })

        setProductsData(Object.values(grouped))
      })
      .catch((err) => {
        console.error("CSV okunamadı:", err)
        setError("Ürün verisi yüklenemedi.")
      })
  }, [])

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ürünler</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Toplam Ürünler</CardTitle>
            <CardDescription>Gruplanmış ürün sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {productsData.length || "Yükleniyor..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Toplam Varyasyon</CardTitle>
            <CardDescription>Varyasyon sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {productsData.reduce((sum, p) => sum + p.variations.length, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Yakıt Türleri</CardTitle>
            <CardDescription>Farklı yakıt seçenekleri</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {
                new Set(
                  productsData.flatMap((p) => p.variations.map((v) => v.fuel).filter(Boolean))
                ).size
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Listesi</CardTitle>
          <CardDescription>Varyasyonlarla birlikte ürünler</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {productsData.map((product, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    <Link
                      href={`/products/edit/${encodeURIComponent(product.name)}`}
                      className="underline hover:text-primary"
                    >
                      {product.name}
                    </Link>{" "}({product.variations.length} varyasyon)
                  </AccordionTrigger>
                  <AccordionContent>
                    <table className="w-full text-sm border mt-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border px-2 py-1">SKU</th>
                          <th className="border px-2 py-1">Yakıt</th>
                          <th className="border px-2 py-1">Şanzıman</th>
                          <th className="border px-2 py-1">Renk</th>
                          <th className="border px-2 py-1">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variations.map((v, j) => (
                          <tr key={j}>
                            <td className="border px-2 py-1">{v.sku || "-"}</td>
                            <td className="border px-2 py-1">{v.fuel || "-"}</td>
                            <td className="border px-2 py-1">{v.transmission || "-"}</td>
                            <td className="border px-2 py-1">{v.color || "-"}</td>
                            <td className="border px-2 py-1">{v.status === "1" ? "Yayında" : "Pasif"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
