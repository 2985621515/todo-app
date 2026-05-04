export interface Todo {
  id: number
  text: string
  done: boolean
  priority: "high" | "medium" | "low"
  due_date: string | null
}

export type Priority = 'high' | 'medium' | 'low'

export interface User {
  id: number
  username: string
  nickname: string | null
  avatar_color: string | null
  avatar: string | null
  created_at: string
}

export interface ProfileFields {
  nickname?: string | null
}
