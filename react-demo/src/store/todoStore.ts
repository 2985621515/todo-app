import { makeAutoObservable } from "mobx"
import type { Todo } from "../types/todo"

import {
  getTodos,
  addTodoApi,
  deleteTodoApi,
  editTodoApi,
  toggleTodoApi,
  clearTodosApi
} from "../api/todo"

// 任务状态管理:创建一个TodoStore类,用于管理任务列表
class TodoStore {
  list: Todo[] = []// 任务列表：全局状态

  // 构造函数：初始化状态
  constructor() {
    makeAutoObservable(this)
  }

  // ==============================================
  // 初始化（从后端获取）
  // ==============================================
  async fetchTodos() {// 从后端获取任务列表
    try {
      const res = await getTodos() //getTodos()返回的是一个Promise
      this.list = res.data
    } catch (error) {
      console.error("获取任务失败", error)
    }
  }

  // ==============================================
  // 添加
  // ==============================================
  async addTodo(text: string) {
    if (!text.trim()) return

    try {
      const res = await addTodoApi(text)
      this.list.push(res.data)
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
  async editTodo(id: number, text: string) {
    if (!text.trim()) return

    try {
      await editTodoApi(id, text)

      const todo = this.list.find(item => item.id === id)
      if (todo) {
        todo.text = text
      }
    } catch (error) {
      console.error("编辑失败", error)
    }
  }

  // ==============================================
  //清空
  // ==============================================
  async clearTodos() {
    try {
      await clearTodosApi()
      this.list = []
    } catch (error) {
      console.error("清空失败", error)
    }
  }
}


const todoStore = new TodoStore()
export default todoStore