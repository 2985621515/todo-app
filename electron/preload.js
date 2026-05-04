const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getTodos: () => ipcRenderer.invoke('todos:list'),
  addTodo: (text, priority) => ipcRenderer.invoke('todos:add', text, priority),
  deleteTodo: (id) => ipcRenderer.invoke('todos:delete', id),
  editTodo: (id, text, priority) => ipcRenderer.invoke('todos:edit', id, text, priority),
  toggleTodo: (id) => ipcRenderer.invoke('todos:toggle', id),
  clearTodos: () => ipcRenderer.invoke('todos:clear')
})
