import VehicleForm from "../../vehicle-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getVehicles } from "@/app/admin/actions"
import { notFound } from "next/navigation"

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const vehicles = await getVehicles()
  const vehicle = vehicles.find((v) => v.id === params.id)

  if (!vehicle) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/vehicles" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">Araç Düzenle</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Araç Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm vehicle={vehicle} />
        </CardContent>
      </Card>
    </div>
  )
}

