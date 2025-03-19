import { Card, CardContent } from "@/components/ui/card"
import { Users, ShoppingBag, CheckSquare, DollarSign } from "lucide-react"

export default function DashboardStats() {
  // Örnek veriler - gerçek uygulamada veritabanından gelecek
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      icon: <Users className="h-5 w-5 text-blue-600" />,
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Total Products",
      value: "45",
      icon: <ShoppingBag className="h-5 w-5 text-green-600" />,
      change: "+3.2%",
      changeType: "positive",
    },
    {
      title: "Tasks Completed",
      value: "12/24",
      icon: <CheckSquare className="h-5 w-5 text-yellow-600" />,
      change: "50%",
      changeType: "neutral",
    },
    {
      title: "Total Revenue",
      value: "$12,543",
      icon: <DollarSign className="h-5 w-5 text-purple-600" />,
      change: "+18.2%",
      changeType: "positive",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <p
                  className={`text-xs mt-1 ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div className="p-3 rounded-full bg-gray-100">{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

