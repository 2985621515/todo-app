import { makeAutoObservable } from "mobx"
import type { Todo, Priority } from "../types/todo"

import {
  getTodos,
  addTodoApi,
  deleteTodoApi,
  editTodoApi,
  toggleTodoApi,
  clearTodosApi
} from "../api/electron"

class TodoStore {
  list: Todo[] = []
  loading = true
  filter: "all" | "active" | "completed" = "all"

  get filteredList() {
    if (this.filter === "active") return this.list.filter(item => !item.done)
    if (this.filter === "completed") return this.list.filter(item => item.done)
    return this.list
  }

  constructor() {
    makeAutoObservable(this)
  }

  // ==============================================
  // 初始化（从后端获取）
  // ==============================================
  async fetchTodos() {
    this.loading = true
    try {
      const res = await getTodos()
      if (Array.isArray(res)) {
        this.list = res
      }
      this.loading = false
    } catch (error) {
      console.error("获取任务失败，1秒后重试", error)
      setTimeout(() => this.fetchTodos(), 1000)
    }
  }

  // ==============================================
  // 添加
  // ==============================================
  async addTodo(text: string, priority: Priority = 'medium') {
    if (!text.trim()) return

    try {
      const res = await addTodoApi(text, priority)
      if (res && !('error' in res)) {
        this.list.push(res)
      }
    } catch (error) {
      console.error("添加失败", error)
    }
  }

  // ==============================================
  // 删除
  // ==============================================
  async deleteTodo(id: number) {
    try {
      await deleteTodoApi(id)
      this.list = this.list.filter(item => item.id !== id)
    } catch (error) {
      console.error("删除失败", error)
    }
  }

  // ==============================================
  // 切换状态
  // ==============================================
  async toggleTodo(id: number) {
    try {
      await toggleTodoApi(id)
      const todo = this.list.find(item => item.id === id)
      if (todo) {
        todo.done = !todo.done
      }
    } catch (error) {
      console.error("状态切换失败", error)
    }
  }

  // ==============================================
  // 编辑
  // ==============================================
  async editTodo(id: number, text: string, priority: Priority) {
    if (!text.trim()) return

    try {
      await editTodoApi(id, text, priority)
      const todo = this.list.find(item => item.id === id)
      if (todo) {
        todo.text = text
        todo.priority = priority
      }
    } catch (error) {
      console.error("编辑失败", error)
    }
  }

  // ==============================================
  // 清空
  // ==============================================
  async clearTodos() {
    try {
      await clearTodosApi()
      this.list = []
    } catch (error) {
      console.error("清空失败", error)
    }
  }

  setFilter(filter: "all" | "active" | "completed") {
    this.filter = filter
  }

  // 用户登出时清空列表
  reset() {
    this.list = []
    this.loading = true
    this.filter = "all"
  }
}

const todoStore = new TodoStore()
export default todoStore
