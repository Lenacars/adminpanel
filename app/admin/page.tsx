import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getVehicleStats, getRecentOrders } from "./actions"
import { BarChart, Car, DollarSign, Users } from "lucide-react"
import RecentOrders from "./components/recent-orders"

export default async function AdminDashboard() {
  const stats = await getVehicleStats()
  const recentOrders = await getRecentOrders()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Araç</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalVehicles}</h3>
                <p className="text-xs mt-1 text-green-600">+{stats.newVehicles} yeni araç bu ay</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-700">
                <Car className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktif Kiralamalar</p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeRentals}</h3>
                <p className="text-xs mt-1 text-green-600">%{stats.rentalIncreasePercentage} artış</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-700">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Kullanıcı</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
                <p className="text-xs mt-1 text-green-600">+{stats.newUsers} yeni kullanıcı bu ay</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-700">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aylık Gelir</p>
                <h3 className="text-2xl font-bold mt-1">₺{stats.monthlyRevenue.toLocaleString()}</h3>
                <p className="text-xs mt-1 text-green-600">%{stats.revenueIncreasePercentage} artış</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-700">
                <BarChart className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Son Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={recentOrders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popüler Araçlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularVehicles.map((vehicle, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={vehicle.image || "/placeholder.svg"}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{vehicle.name}</h4>
                    <p className="text-sm text-gray-500">{vehicle.rentCount} kiralama</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₺{vehicle.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">günlük</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

