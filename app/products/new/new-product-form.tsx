"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createProduct } from "./actions"

interface NewProductFormProps {
  categories: any[]
}

export default function NewProductForm({ categories }: NewProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    regular_price: "",
    sale_price: "",
    description: "",
    short_description: "",
    categories: [],
    stock_status: "instock",
    manage_stock: false,
    stock_quantity: 0,
    sku: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setFormData((prev) => {
      const currentCategories = [...prev.categories]

      if (checked) {
        if (!currentCategories.includes(categoryId)) {
          currentCategories.push(categoryId)
        }
      } else {
        const index = currentCategories.indexOf(categoryId)
        if (index !== -1) {
          currentCategories.splice(index, 1)
        }
      }

      return { ...prev, categories: currentCategories }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Yeni ürün oluştur
      const newProduct = await createProduct(formData)

      // Başarılı olduğunda ürün detay sayfasına yönlendir
      router.push(`/products/${newProduct.id}`)
      router.refresh()
    } catch (err) {
      console.error("Ürün oluşturma hatası:", err)
      setError("Ürün oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ürün Adı</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regular_price">Normal Fiyat (₺)</Label>
              <Input
                id="regular_price"
                name="regular_price"
                type="number"
                step="0.01"
                value={formData.regular_price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">İndirimli Fiyat (₺)</Label>
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Stok Kodu)</Label>
              <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock_status">Stok Durumu</Label>
              <Select
                value={formData.stock_status}
                onValueChange={(value) => handleSelectChange("stock_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Stok durumu seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instock">Stokta</SelectItem>
                  <SelectItem value="outofstock">Tükendi</SelectItem>
                  <SelectItem value="onbackorder">Ön Siparişte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="manage_stock"
                checked={formData.manage_stock}
                onCheckedChange={(checked) => handleCheckboxChange("manage_stock", checked as boolean)}
              />
              <Label htmlFor="manage_stock">Stok Yönetimini Etkinleştir</Label>
            </div>

            {formData.manage_stock && (
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stok Miktarı</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Kategoriler</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={formData.categories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="short_description">Kısa Açıklama</Label>
            <Textarea
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detaylı Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Oluşturuluyor..." : "Ürün Oluştur"}
        </Button>
      </div>
    </form>
  )
}

