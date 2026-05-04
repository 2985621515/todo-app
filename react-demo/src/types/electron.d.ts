import type { Todo, Priority, User, ProfileFields } from "./todo"

interface ElectronAPI {
  // 用户
  register: (username: string, password: string) => Promise<User | { error: string }>
  login: (username: string, password: string) => Promise<User | { error: string }>
  logout: () => Promise<{ success: boolean }>
  getCurrentUser: () => Promise<User | null>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean } | { error: string }>
  updateProfile: (fields: ProfileFields) => Promise<User | { error: string }>
  uploadAvatar: () => Promise<User | { success: false; reason: string } | { error: string }>

  // Todo
  getTodos: () => Promise<Todo[]>
  addTodo: (text: string, priority: Priority, dueDate?: string | null) => Promise<Todo>
  deleteTodo: (id: number) => Promise<{ success: boolean }>
  editTodo: (id: number, text: string, priority: Priority, dueDate?: string | null) => Promise<{ success: boolean }>
  toggleTodo: (id: number) => Promise<{ success: boolean }>
  clearTodos: () => Promise<{ success: boolean }>

  // 导出
  exportTodos: (format: 'json' | 'csv') => Promise<{ success: boolean; reason?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
