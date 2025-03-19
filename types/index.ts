export type Vehicle = {
  id: string
  brand: string
  model: string
  year: number
  fuelType: string
  transmission: string
  segment: string
  supplier: string
  bodyType: string
  price: number
  image: string
  status: string
  featured: boolean
}

export type Order = {
  id: string
  orderNumber: string
  customerName: string
  vehicleName: string
  totalAmount: number
  status: string
  createdAt: string
}

export type VehicleStats = {
  totalVehicles: number
  newVehicles: number
  activeRentals: number
  rentalIncreasePercentage: number
  totalUsers: number
  newUsers: number
  monthlyRevenue: number
  revenueIncreasePercentage: number
  popularVehicles: {
    name: string
    image: string
    rentCount: number
    price: number
  }[]
}

