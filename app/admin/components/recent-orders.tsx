import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/types"

type RecentOrdersProps = {
  orders: Order[]
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "ACTIVE":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Tamamlandı"
      case "PENDING":
        return "Beklemede"
      case "CANCELLED":
        return "İptal Edildi"
      case "ACTIVE":
        return "Aktif"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center gap-4 p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Sipariş #{order.orderNumber}</h4>
              <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              {order.customerName} • {order.vehicleName}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">₺{order.totalAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

