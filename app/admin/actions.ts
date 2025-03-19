"use server"

import { revalidatePath } from "next/cache"
import type { Order, Vehicle, VehicleStats } from "@/types"

// Dashboard istatistikleri
export async function getVehicleStats(): Promise<VehicleStats> {
  // Gerçek uygulamada veritabanından gelecek
  return {
    totalVehicles: 124,
    newVehicles: 8,
    activeRentals: 42,
    rentalIncreasePercentage: 12,
    totalUsers: 1543,
    newUsers: 87,
    monthlyRevenue: 156750,
    revenueIncreasePercentage: 8,
    popularVehicles: [
      { name: "Mercedes C200", image: "/cars/mercedes-c200.jpg", rentCount: 28, price: 1200 },
      { name: "BMW 320i", image: "/cars/bmw-320i.jpg", rentCount: 24, price: 1150 },
      { name: "Audi A4", image: "/cars/audi-a4.jpg", rentCount: 22, price: 1100 },
      { name: "Volvo S60", image: "/cars/volvo-s60.jpg", rentCount: 18, price: 950 },
    ],
  }
}

// Son siparişleri getir
export async function getRecentOrders(): Promise<Order[]> {
  // Gerçek uygulamada veritabanından gelecek
  return [
    {
      id: "1",
      orderNumber: "10045",
      customerName: "Ahmet Yılmaz",
      vehicleName: "Mercedes C200",
      totalAmount: 3600,
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 saat önce
    },
    {
      id: "2",
      orderNumber: "10046",
      customerName: "Ayşe Demir",
      vehicleName: "BMW 320i",
      totalAmount: 2300,
      status: "ACTIVE",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 saat önce
    },
    {
      id: "3",
      orderNumber: "10047",
      customerName: "Mehmet Kaya",
      vehicleName: "Audi A4",
      totalAmount: 4400,
      status: "PENDING",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 saat önce
    },
    {
      id: "4",
      orderNumber: "10048",
      customerName: "Zeynep Şahin",
      vehicleName: "Volvo S60",
      totalAmount: 2850,
      status: "CANCELLED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 saat önce
    },
  ]
}

// Araçları getir
export async function getVehicles(): Promise<Vehicle[]> {
  // Gerçek uygulamada veritabanından gelecek
  return [
    {
      id: "1",
      brand: "Mercedes",
      model: "C200",
      year: 2022,
      fuelType: "Benzin",
      transmission: "Otomatik",
      segment: "Sedan",
      supplier: "LenaCars",
      bodyType: "Sedan",
      price: 1200,
      image: "/cars/mercedes-c200.jpg",
      status: "ACTIVE",
      featured: true,
    },
    {
      id: "2",
      brand: "BMW",
      model: "320i",
      year: 2021,
      fuelType: "Benzin",
      transmission: "Otomatik",
      segment: "Sedan",
      supplier: "LenaCars",
      bodyType: "Sedan",
      price: 1150,
      image: "/cars/bmw-320i.jpg",
      status: "ACTIVE",
      featured: true,
    },
    {
      id: "3",
      brand: "Audi",
      model: "A4",
      year: 2022,
      fuelType: "Dizel",
      transmission: "Otomatik",
      segment: "Sedan",
      supplier: "LenaCars",
      bodyType: "Sedan",
      price: 1100,
      image: "/cars/audi-a4.jpg",
      status: "ACTIVE",
      featured: false,
    },
    {
      id: "4",
      brand: "Volvo",
      model: "S60",
      year: 2021,
      fuelType: "Hibrit",
      transmission: "Otomatik",
      segment: "Sedan",
      supplier: "LenaCars",
      bodyType: "Sedan",
      price: 950,
      image: "/cars/volvo-s60.jpg",
      status: "ACTIVE",
      featured: false,
    },
  ]
}

// Araç ekle
export async function addVehicle(formData: FormData): Promise<Vehicle> {
  // Simüle edilmiş gecikme
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Form verilerini al
  const brand = formData.get("brand") as string
  const model = formData.get("model") as string
  const year = Number.parseInt(formData.get("year") as string)
  const fuelType = formData.get("fuelType") as string
  const transmission = formData.get("transmission") as string
  const segment = formData.get("segment") as string
  const supplier = formData.get("supplier") as string
  const bodyType = formData.get("bodyType") as string
  const price = Number.parseInt(formData.get("price") as string)
  const featured = formData.get("featured") === "on"

  // Yeni araç oluştur
  const newVehicle: Vehicle = {
    id: Date.now().toString(),
    brand,
    model,
    year,
    fuelType,
    transmission,
    segment,
    supplier,
    bodyType,
    price,
    image: "/cars/placeholder.jpg", // Gerçek uygulamada yüklenen resim
    status: "ACTIVE",
    featured,
  }

  // Gerçek uygulamada veritabanına kaydet
  // await db.vehicle.create({ data: newVehicle })

  // Cache'i yenile
  revalidatePath("/admin/vehicles")
  revalidatePath("/") // Ana sayfayı da yenile (öne çıkan araçlar için)

  return newVehicle
}

// Araç güncelle
export async function updateVehicle(id: string, formData: FormData): Promise<Vehicle> {
  // Simüle edilmiş gecikme
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Form verilerini al
  const brand = formData.get("brand") as string
  const model = formData.get("model") as string
  const year = Number.parseInt(formData.get("year") as string)
  const fuelType = formData.get("fuelType") as string
  const transmission = formData.get("transmission") as string
  const segment = formData.get("segment") as string
  const supplier = formData.get("supplier") as string
  const bodyType = formData.get("bodyType") as string
  const price = Number.parseInt(formData.get("price") as string)
  const status = formData.get("status") as string
  const featured = formData.get("featured") === "on"

  // Güncellenmiş araç
  const updatedVehicle: Vehicle = {
    id,
    brand,
    model,
    year,
    fuelType,
    transmission,
    segment,
    supplier,
    bodyType,
    price,
    image: "/cars/placeholder.jpg", // Gerçek uygulamada mevcut veya yüklenen resim
    status,
    featured,
  }

  // Gerçek uygulamada veritabanında güncelle
  // await db.vehicle.update({ where: { id }, data: updatedVehicle })

  // Cache'i yenile
  revalidatePath("/admin/vehicles")
  revalidatePath(`/vehicles/${id}`) // Araç detay sayfasını yenile
  revalidatePath("/") // Ana sayfayı da yenile (öne çıkan araçlar için)

  return updatedVehicle
}

// Araç sil
export async function deleteVehicle(id: string): Promise<string> {
  // Simüle edilmiş gecikme
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Gerçek uygulamada veritabanından sil
  // await db.vehicle.delete({ where: { id } })

  // Cache'i yenile
  revalidatePath("/admin/vehicles")
  revalidatePath("/") // Ana sayfayı da yenile (öne çıkan araçlar için)

  return id
}

// Araç durumunu güncelle (stoktan kaldırma veya gizleme)
export async function updateVehicleStatus(id: string, status: string): Promise<Vehicle> {
  // Simüle edilmiş gecikme
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Gerçek uygulamada veritabanında güncelle
  // await db.vehicle.update({ where: { id }, data: { status } })

  // Örnek araç verisi
  const vehicle = {
    id,
    brand: "Mercedes",
    model: "C200",
    year: 2022,
    fuelType: "Benzin",
    transmission: "Otomatik",
    segment: "Sedan",
    supplier: "LenaCars",
    bodyType: "Sedan",
    price: 1200,
    image: "/cars/mercedes-c200.jpg",
    status,
    featured: true,
  }

  // Cache'i yenile
  revalidatePath("/admin/vehicles")
  revalidatePath(`/vehicles/${id}`) // Araç detay sayfasını yenile
  revalidatePath("/") // Ana sayfayı da yenile (öne çıkan araçlar için)

  return vehicle
}

// Araçları öne çıkar/çıkarma
export async function toggleVehicleFeatured(id: string, featured: boolean): Promise<Vehicle> {
  // Simüle edilmiş gecikme
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Gerçek uygulamada veritabanında güncelle
  // await db.vehicle.update({ where: { id }, data: { featured } })

  // Örnek araç verisi
  const vehicle = {
    id,
    brand: "Mercedes",
    model: "C200",
    year: 2022,
    fuelType: "Benzin",
    transmission: "Otomatik",
    segment: "Sedan",
    supplier: "LenaCars",
    bodyType: "Sedan",
    price: 1200,
    image: "/cars/mercedes-c200.jpg",
    status: "ACTIVE",
    featured,
  }

  // Cache'i yenile
  revalidatePath("/admin/vehicles")
  revalidatePath("/") // Ana sayfayı da yenile (öne çıkan araçlar için)

  return vehicle
}

