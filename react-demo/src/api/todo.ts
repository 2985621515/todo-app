import request from "./request"
import type { Todo } from "../types/todo"

// 获取列表
export const getTodos = () => {
  return request.get<Todo[]>("/todos")
}

// 添加
export const addTodoApi = (text: string) => {
  return request.post<Todo>("/todos", { text })
  //这里的{text}是一个json对象
  // {text}等价于{text : text} => {text:"传入的string数据"}，ES6语法糖
}

// 删除
export const deleteTodoApi = (id: number) => {
  return request.delete(`/todos/${id}`)
}

// 修改
export const editTodoApi = (id: number, text: string) => {
  return request.put(`/todos/${id}`, { text })
}

// 切换状态
export const toggleTodoApi = (id: number) => {
  return request.patch(`/todos/${id}`)
}

// 清空
export const clearTodosApi = () => {
  return request.delete("/todos")
}