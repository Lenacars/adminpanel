import { getTodos } from "@/app/actions"
import TodoList from "../todo-list"

export default async function TasksPage() {
  const todos = await getTodos()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Task Management</h1>
      <TodoList initialTodos={todos} />
    </div>
  )
}

