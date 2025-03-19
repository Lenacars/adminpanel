import type { Todo } from "@/app/actions"
import { Check, Clock } from "lucide-react"

type RecentTasksProps = {
  tasks: Todo[]
}

export default function RecentTasks({ tasks }: RecentTasksProps) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">No tasks found</p>
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-full ${
              task.completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {task.completed ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          </div>
          <div>
            <p className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>{task.text}</p>
            <p className="text-xs text-muted-foreground">{task.completed ? "Completed" : "In progress"}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

