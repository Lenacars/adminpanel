"use client"

import { useState, useTransition } from "react"
import { useOptimistic } from "react"
import type { Vehicle } from "@/types"
import { deleteVehicle, updateVehicleStatus, toggleVehicleFeatured } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pencil, Trash2, MoreVertical, Eye, EyeOff, Star, StarOff } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type VehicleListProps = {
  initialVehicles: Vehicle[]
}

export default function VehicleList({ initialVehicles }: VehicleListProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles)
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBrand, setFilterBrand] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null)

  // Optimistic state for deleting a vehicle
  const [optimisticVehicles, deleteOptimisticVehicle] = useOptimistic(vehicles, (state, id: string) =>
    state.filter((vehicle) => vehicle.id !== id),
  )

  // Optimistic state for updating vehicle status
  const [displayedVehicles, updateOptimisticVehicleStatus] = useOptimistic(
    optimisticVehicles,
    (state, update: { id: string; status: string }) =>
      state.map((vehicle) => (vehicle.id === update.id ? { ...vehicle, status: update.status } : vehicle)),
  )

  // Optimistic state for toggling featured status
  const [finalVehicles, toggleOptimisticFeatured] = useOptimistic(
    displayedVehicles,
    (state, update: { id: string; featured: boolean }) =>
      state.map((vehicle) => (vehicle.id === update.id ? { ...vehicle, featured: update.featured } : vehicle)),
  )

  // Filtreleme ve arama
  const filteredVehicles = finalVehicles.filter((vehicle) => {
    const matchesSearch =
      searchQuery === "" || `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBrand = filterBrand === "" || vehicle.brand === filterBrand

    const matchesStatus = filterStatus === "" || vehicle.status === filterStatus

    return matchesSearch && matchesBrand && matchesStatus
  })

  // Marka listesi
  const brands = Array.from(new Set(vehicles.map((v) => v.brand)))

  // Araç silme işlemi
  const handleDeleteVehicle = async (id: string) => {
    setDeleteDialogOpen(false)
    setVehicleToDelete(null)

    // Optimistically update UI
    startTransition(() => {
      deleteOptimisticVehicle(id)
    })

    try {
      // Actually perform the server action
      await deleteVehicle(id)

      toast({
        title: "Araç silindi",
        description: "Araç başarıyla silindi.",
      })
    } catch (error) {
      // If there's an error, revert the optimistic update
      setVehicles(vehicles)

      toast({
        title: "Hata",
        description: "Araç silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Araç durumunu güncelleme
  const handleUpdateStatus = async (id: string, status: string) => {
    // Optimistically update UI
    startTransition(() => {
      updateOptimisticVehicleStatus({ id, status })
    })

    try {
      // Actually perform the server action
      await updateVehicleStatus(id, status)

      toast({
        title: "Durum güncellendi",
        description: `Araç durumu "${status}" olarak güncellendi.`,
      })
    } catch (error) {
      // If there's an error, revert the optimistic update
      setVehicles(vehicles)

      toast({
        title: "Hata",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  // Öne çıkarma durumunu güncelleme
  const handleToggleFeatured = async (id: string, featured: boolean) => {
    // Optimistically update UI
    startTransition(() => {
      toggleOptimisticFeatured({ id, featured })
    })

    try {
      // Actually perform the server action
      await toggleVehicleFeatured(id, featured)

      toast({
        title: featured ? "Öne çıkarıldı" : "Öne çıkarma kaldırıldı",
        description: featured ? "Araç ana sayfada öne çıkarılacak." : "Araç artık ana sayfada öne çıkarılmayacak.",
      })
    } catch (error) {
      // If there's an error, revert the optimistic update
      setVehicles(vehicles)

      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input placeholder="Araç ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Marka filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Markalar</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="HIDDEN">Gizli</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Stokta Yok</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={vehicle.image || "/placeholder.svg"}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                {vehicle.featured && <Badge className="bg-yellow-500">Öne Çıkan</Badge>}
                <Badge
                  className={
                    vehicle.status === "ACTIVE"
                      ? "bg-green-500"
                      : vehicle.status === "HIDDEN"
                        ? "bg-gray-500"
                        : "bg-red-500"
                  }
                >
                  {vehicle.status === "ACTIVE" ? "Aktif" : vehicle.status === "HIDDEN" ? "Gizli" : "Stokta Yok"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {vehicle.year} • {vehicle.fuelType} • {vehicle.transmission}
                  </p>
                  <p className="font-medium mt-2">₺{vehicle.price.toLocaleString()} / gün</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={`/admin/vehicles/edit/${vehicle.id}`}>
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" /> Düzenle
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      onClick={() => {
                        setVehicleToDelete(vehicle.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-red-500">Sil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFeatured(vehicle.id, !vehicle.featured)}>
                      {vehicle.featured ? (
                        <>
                          <StarOff className="h-4 w-4 mr-2" /> Öne çıkarmayı kaldır
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" /> Öne çıkar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(vehicle.id, vehicle.status === "ACTIVE" ? "HIDDEN" : "ACTIVE")}
                    >
                      {vehicle.status === "ACTIVE" ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" /> Gizle
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" /> Göster
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Araç bulunamadı.</p>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aracı silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Araç sistemden tamamen silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => vehicleToDelete && handleDeleteVehicle(vehicleToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

