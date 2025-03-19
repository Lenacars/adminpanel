"use server"

import { revalidatePath } from "next/cache"

export type Vehicle = {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: "available" | "sold" | "maintenance"
}

// Simulated database
let vehicles: Vehicle[] = [
  { id: "1", make: "Toyota", model: "Corolla", year: 2020, price: 20000, status: "available" },
  { id: "2", make: "Honda", model: "Civic", year: 2021, price: 22000, status: "sold" },
  { id: "3", make: "Ford", model: "Mustang", year: 2019, price: 35000, status: "maintenance" },
]

export async function getVehicles() {
  // In a real app, this would be a database query
  return [...vehicles]
}

export async function addVehicle(vehicle: Omit<Vehicle, "id">) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate potential error (1 in 10 chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to add vehicle. Please try again.")
  }

  const newVehicle = {
    ...vehicle,
    id: Date.now().toString(),
  }

  vehicles.push(newVehicle)
  revalidatePath("/admin/vehicles")
  return newVehicle
}

export async function updateVehicle(updatedVehicle: Vehicle) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate potential error (1 in 10 chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to update vehicle. Please try again.")
  }

  vehicles = vehicles.map((vehicle) => (vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle))

  revalidatePath("/admin/vehicles")
  return updatedVehicle
}

export async function deleteVehicle(id: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate potential error (1 in 10 chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to delete vehicle. Please try again.")
  }

  vehicles = vehicles.filter((vehicle) => vehicle.id !== id)
  revalidatePath("/admin/vehicles")
  return id
}

