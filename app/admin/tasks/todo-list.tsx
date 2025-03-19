"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useOptimistic } from "react"
// Import yolunu düzelt
import { type Todo, addTodo, toggleTodo, deleteTodo } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Trash2 } from "lucide-react"

type TodoListProps = {
  initialTodos: Todo[]
}

export default function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTodoText, setNewTodoText] = useState("")
  const [isPending, startTransition] = useTransition()

  // Optimistic state for adding a todo
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(todos, (state, newTodo: Todo) => [...state, newTodo])

  // Optimistic state for toggling a todo
  const [displayedTodos, toggleOptimisticTodo] = useOptimistic(optimisticTodos, (state, id: string) =>
    state.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
  )

  // Handle adding a new todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoText.trim()) return

    const optimisticTodo = {
      id: "temp-" + Date.now(),
      text: newTodoText,
      completed: false,
    }

    // Optimistically update UI within a transition
    startTransition(() => {
      addOptimisticTodo(optimisticTodo)
    })

    setNewTodoText("")

    try {
      // Actually perform the server action
      const newTodo = await addTodo(newTodoText)

      // Update the local state with the server response
      setTodos((prev) => [...prev.filter((t) => t.id !== optimisticTodo.id), newTodo])
    } catch (error) {
      // If there's an error, revert the optimistic update
      setTodos(todos)
      alert("Failed to add todo")
    }
  }

  // Handle toggling a todo
  const handleToggleTodo = async (id: string) => {
    // Optimistically update UI within a transition
    startTransition(() => {
      toggleOptimisticTodo(id)
    })

    try {
      // Actually perform the server action
      await toggleTodo(id)

      // Update the local state with the server response
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
    } catch (error) {
      // If there's an error, revert the optimistic update
      setTodos(todos)
      alert("Failed to toggle todo")
    }
  }

  // Handle deleting a todo
  const handleDeleteTodo = async (id: string) => {
    // Optimistically update UI within a transition
    startTransition(() => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    })

    try {
      // Actually perform the server action
      await deleteTodo(id)
    } catch (error) {
      // If there's an error, revert the optimistic update
      setTodos(todos)
      alert("Failed to delete todo")
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <Input
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <Button type="submit" disabled={isPending}>
          Add
        </Button>
      </form>

      <div className="space-y-2">
        {displayedTodos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center justify-between p-3 border rounded-lg ${
              todo.id.startsWith("temp-") ? "opacity-70" : ""
            } ${todo.completed ? "bg-gray-50" : "bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className={`h-6 w-6 rounded-full ${todo.completed ? "bg-green-100 text-green-700" : ""}`}
                onClick={() => handleToggleTodo(todo.id)}
                disabled={isPending || todo.id.startsWith("temp-")}
              >
                {todo.completed && <Check className="h-4 w-4" />}
              </Button>
              <span className={todo.completed ? "line-through text-gray-500" : ""}>{todo.text}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteTodo(todo.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700"
              disabled={isPending || todo.id.startsWith("temp-")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

