"use client"

import type React from "react"

import { useTransition } from "react"
import type { Vehicle } from "@/types"
import { addVehicle, updateVehicle } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

type VehicleFormProps = {
  vehicle?: Vehicle
}

export default function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isEditing = !!vehicle

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateVehicle(vehicle.id, formData)
          toast({
            title: "Araç güncellendi",
            description: "Araç bilgileri başarıyla güncellendi.",
          })
        } else {
          await addVehicle(formData)
          toast({
            title: "Araç eklendi",
            description: "Yeni araç başarıyla eklendi.",
          })
          e.currentTarget.reset()
        }

        router.push("/admin/vehicles")
      } catch (error) {
        toast({
          title: "Hata",
          description: "İşlem sırasında bir hata oluştu.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="brand">Marka</Label>
          <Input id="brand" name="brand" defaultValue={vehicle?.brand} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" defaultValue={vehicle?.model} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Yıl</Label>
          <Input id="year" name="year" type="number" min="1900" max="2099" defaultValue={vehicle?.year} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Günlük Fiyat (₺)</Label>
          <Input id="price" name="price" type="number" min="0" defaultValue={vehicle?.price} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuelType">Yakıt Türü</Label>
          <Select name="fuelType" defaultValue={vehicle?.fuelType || "Benzin"}>
            <SelectTrigger>
              <SelectValue placeholder="Yakıt türü seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Benzin">Benzin</SelectItem>
              <SelectItem value="Dizel">Dizel</SelectItem>
              <SelectItem value="Hibrit">Hibrit</SelectItem>
              <SelectItem value="Elektrik">Elektrik</SelectItem>
              <SelectItem value="LPG">LPG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transmission">Vites</Label>
          <Select name="transmission" defaultValue={vehicle?.transmission || "Otomatik"}>
            <SelectTrigger>
              <SelectValue placeholder="Vites türü seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Otomatik">Otomatik</SelectItem>
              <SelectItem value="Manuel">Manuel</SelectItem>
              <SelectItem value="Yarı Otomatik">Yarı Otomatik</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="segment">Segment</Label>
          <Select name="segment" defaultValue={vehicle?.segment || "Sedan"}>
            <SelectTrigger>
              <SelectValue placeholder="Segment seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ekonomik">Ekonomik</SelectItem>
              <SelectItem value="Sedan">Sedan</SelectItem>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="Lüks">Lüks</SelectItem>
              <SelectItem value="Spor">Spor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bodyType">Kasa Tipi</Label>
          <Select name="bodyType" defaultValue={vehicle?.bodyType || "Sedan"}>
            <SelectTrigger>
              <SelectValue placeholder="Kasa tipi seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sedan">Sedan</SelectItem>
              <SelectItem value="Hatchback">Hatchback</SelectItem>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="Coupe">Coupe</SelectItem>
              <SelectItem value="Cabrio">Cabrio</SelectItem>
              <SelectItem value="Station Wagon">Station Wagon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Tedarikçi</Label>
          <Input id="supplier" name="supplier" defaultValue={vehicle?.supplier || "LenaCars"} required />
        </div>

        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="status">Durum</Label>
            <Select name="status" defaultValue={vehicle?.status || "ACTIVE"}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="HIDDEN">Gizli</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Stokta Yok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox id="featured" name="featured" defaultChecked={vehicle?.featured} />
          <Label htmlFor="featured">Öne çıkar</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Araç Görseli</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
        {vehicle?.image && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Mevcut görsel:</p>
            <img
              src={vehicle.image || "/placeholder.svg"}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-40 h-auto rounded-md"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/vehicles")}>
          İptal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Güncelle" : "Ekle"}
        </Button>
      </div>
    </form>
  )
}

