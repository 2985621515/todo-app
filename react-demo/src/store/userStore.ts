import { makeAutoObservable } from "mobx"
import type { User } from "../types/todo"
import * as api from "../api/electron"

class UserStore {
  currentUser: User | null = null
  loading = true

  get isLoggedIn() {
    return this.currentUser !== null
  }

  constructor() {
    makeAutoObservable(this)
  }

  async checkSession() {
    this.loading = true
    try {
      const user = await api.getCurrentUser()
      this.currentUser = user
    } catch {
      this.currentUser = null
    } finally {
      this.loading = false
    }
  }

  async login(username: string, password: string) {
    const result = await api.login(username, password)
    if ('error' in result) return result.error
    this.currentUser = result
    return null
  }

  async register(username: string, password: string) {
    const result = await api.register(username, password)
    if ('error' in result) return result.error
    this.currentUser = result
    return null
  }

  async logout() {
    await api.logout()
    this.currentUser = null
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const result = await api.changePassword(oldPassword, newPassword)
    if ('error' in result) return result.error
    return null
  }

  async updateProfile(fields: { nickname?: string | null }) {
    const result = await api.updateProfile(fields)
    if ('error' in result) return result.error
    this.currentUser = result
    return null
  }

  async uploadAvatar() {
    const result = await api.uploadAvatar()
    if ('error' in result) return result.error
    if (!('id' in result)) return null // canceled
    this.currentUser = result
    return null
  }

  get displayName() {
    if (!this.currentUser) return ''
    return this.currentUser.nickname || this.currentUser.username
  }

  getAvatarColor() {
    if (!this.currentUser) return '#667eea'
    let hash = 0
    for (let i = 0; i < this.currentUser.username.length; i++) {
      hash = this.currentUser.username.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 55%, 55%)`
  }

  getInitial() {
    if (!this.currentUser) return '?'
    const name = this.currentUser.nickname || this.currentUser.username
    return name.charAt(0).toUpperCase()
  }
}

const userStore = new UserStore()
export default userStore
