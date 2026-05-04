const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 用户
  register: (username, password) => ipcRenderer.invoke('user:register', username, password),
  login: (username, password) => ipcRenderer.invoke('user:login', username, password),
  logout: () => ipcRenderer.invoke('user:logout'),
  getCurrentUser: () => ipcRenderer.invoke('user:current'),
  changePassword: (oldPassword, newPassword) => ipcRenderer.invoke('user:changePassword', oldPassword, newPassword),
  updateProfile: (fields) => ipcRenderer.invoke('user:updateProfile', fields),
  uploadAvatar: () => ipcRenderer.invoke('user:uploadAvatar'),

  // Todo
  getTodos: () => ipcRenderer.invoke('todos:list'),
  addTodo: (text, priority, dueDate) => ipcRenderer.invoke('todos:add', text, priority, dueDate),
  deleteTodo: (id) => ipcRenderer.invoke('todos:delete', id),
  editTodo: (id, text, priority, dueDate) => ipcRenderer.invoke('todos:edit', id, text, priority, dueDate),
  toggleTodo: (id) => ipcRenderer.invoke('todos:toggle', id),
  clearTodos: () => ipcRenderer.invoke('todos:clear'),

  // 导出
  exportTodos: (format) => ipcRenderer.invoke('export:todos', format)
})
