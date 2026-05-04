import type { Priority } from "../types/todo"

export const getTodos = () => {
  return window.electronAPI.getTodos()
}

export const addTodoApi = (text: string, priority: Priority = 'medium') => {
  return window.electronAPI.addTodo(text, priority)
}

export const deleteTodoApi = (id: number) => {
  return window.electronAPI.deleteTodo(id)
}

export const editTodoApi = (id: number, text: string, priority: Priority) => {
  return window.electronAPI.editTodo(id, text, priority)
}

export const toggleTodoApi = (id: number) => {
  return window.electronAPI.toggleTodo(id)
}

export const clearTodosApi = () => {
  return window.electronAPI.clearTodos()
}
