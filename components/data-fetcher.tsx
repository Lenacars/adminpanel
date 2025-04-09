"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

// Örnek veri
const dummyData = [
  { id: 1, name: "Ürün A", category: "Elektronik", price: 1299.99, stock: 45 },
  { id: 2, name: "Ürün B", category: "Giyim", price: 299.5, stock: 120 },
  { id: 3, name: "Ürün C", category: "Ev", price: 599.99, stock: 30 },
  { id: 4, name: "Ürün D", category: "Elektronik", price: 2499.99, stock: 15 },
  { id: 5, name: "Ürün E", category: "Giyim", price: 199.99, stock: 200 },
  { id: 6, name: "Ürün F", category: "Ev", price: 899.5, stock: 25 },
  { id: 7, name: "Ürün G", category: "Elektronik", price: 3999.99, stock: 10 },
  { id: 8, name: "Ürün H", category: "Giyim", price: 149.99, stock: 150 },
  { id: 9, name: "Ürün I", category: "Ev", price: 1299.99, stock: 20 },
  { id: 10, name: "Ürün J", category: "Elektronik", price: 799.99, stock: 35 },
]

export default function DataFetcher() {
  const [data, setData] = useState(dummyData)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  // Arama işlevi
  useEffect(() => {
    if (searchTerm) {
      const filteredData = dummyData.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setData(filteredData)
    } else {
      setData(dummyData)
    }
  }, [searchTerm])

  // Veri yenileme simülasyonu
  const refreshData = () => {
    setLoading(true)
    setTimeout(() => {
      setData(dummyData)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ara..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={refreshData} disabled={loading}>
          {loading ? "Yenileniyor..." : "Verileri Yenile"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ürün Adı</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>₺{item.price.toFixed(2)}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Düzenle
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    Sil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

