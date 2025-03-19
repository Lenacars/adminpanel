"use server"

import { revalidatePath } from "next/cache"

export type Todo = {
  id: string
  text: string
  completed: boolean
}

// Simulated database
let todos: Todo[] = [
  { id: "1", text: "Learn Next.js", completed: false },
  { id: "2", text: "Build an admin panel", completed: false },
]

export async function getTodos() {
  return [...todos]
}

export async function addTodo(text: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newTodo = {
    id: Date.now().toString(),
    text,
    completed: false,
  }

  todos.push(newTodo)
  revalidatePath("/admin")
  return newTodo
}

export async function toggleTodo(id: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  todos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))

  revalidatePath("/admin")
  return todos.find((todo) => todo.id === id)
}

export async function deleteTodo(id: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  todos = todos.filter((todo) => todo.id !== id)
  revalidatePath("/admin")
  return id
}

