import type { Priority } from "../types/todo"

// ---------- 用户 ----------
export const register = (username: string, password: string) => {
  return window.electronAPI.register(username, password)
}

export const login = (username: string, password: string) => {
  return window.electronAPI.login(username, password)
}

export const logout = () => {
  return window.electronAPI.logout()
}

export const getCurrentUser = () => {
  return window.electronAPI.getCurrentUser()
}

export const changePassword = (oldPassword: string, newPassword: string) => {
  return window.electronAPI.changePassword(oldPassword, newPassword)
}

export const updateProfile = (fields: { nickname?: string | null; avatar_color?: string | null }) => {
  return window.electronAPI.updateProfile(fields)
}

export const uploadAvatar = () => {
  return window.electronAPI.uploadAvatar()
}

// ---------- Todo ----------
export const getTodos = () => {
  return window.electronAPI.getTodos()
}

export const addTodoApi = (text: string, priority: Priority = 'medium', dueDate?: string | null) => {
  return window.electronAPI.addTodo(text, priority, dueDate ?? null)
}

export const deleteTodoApi = (id: number) => {
  return window.electronAPI.deleteTodo(id)
}

export const editTodoApi = (id: number, text: string, priority: Priority, dueDate?: string | null) => {
  return window.electronAPI.editTodo(id, text, priority, dueDate ?? null)
}

export const toggleTodoApi = (id: number) => {
  return window.electronAPI.toggleTodo(id)
}

export const clearTodosApi = () => {
  return window.electronAPI.clearTodos()
}

// ---------- 导出 ----------
export const exportTodos = (format: 'json' | 'csv') => {
  return window.electronAPI.exportTodos(format)
}
