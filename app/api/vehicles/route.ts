import { getVehicles } from "@/app/actions/vehicle-actions"
import { NextResponse } from "next/server"

export async function GET() {
  const vehicles = await getVehicles()
  return NextResponse.json(vehicles)
}

