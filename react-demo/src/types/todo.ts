export interface Todo {
  id: number
  text: string
  done: boolean
  priority: "high" | "medium" | "low"
}

export type Priority = 'high' | 'medium' | 'low'