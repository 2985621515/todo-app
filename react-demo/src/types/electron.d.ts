import type { Todo, Priority } from "./todo"

interface ElectronAPI {
  getTodos: () => Promise<Todo[]>
  addTodo: (text: string, priority: Priority) => Promise<Todo>
  deleteTodo: (id: number) => Promise<{ success: boolean }>
  editTodo: (id: number, text: string, priority: Priority) => Promise<{ success: boolean }>
  toggleTodo: (id: number) => Promise<{ success: boolean }>
  clearTodos: () => Promise<{ success: boolean }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
