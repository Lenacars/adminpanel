import { getVehicles } from "../actions"
import VehicleList from "./vehicle-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function VehiclesPage() {
  const vehicles = await getVehicles()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Araç Yönetimi</h1>
        <Link href="/admin/vehicles/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Yeni Araç Ekle
          </Button>
        </Link>
      </div>

      <VehicleList initialVehicles={vehicles} />
    </div>
  )
}

