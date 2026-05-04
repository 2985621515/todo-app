const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// 数据库路径
const dbPath = path.join(app.getPath('userData'), 'database.sqlite')
app.setPath('cache', path.join(app.getPath('userData'), 'Cache'))

// ==============================================
// 密码工具
// ==============================================
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return hash === verify
}

// ==============================================
// 数据库初始化
// ==============================================
let db
let currentUserId = null

async function initDB() {
  const sqlite3 = require('sqlite3')
  const { open } = require('sqlite')

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  await db.exec('PRAGMA foreign_keys = ON')

  // 用户表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // 应用设置表（持久化会话等）
  await db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  // todos 表（首次创建时带 user_id；旧表迁移见下方）
  await db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      user_id INTEGER REFERENCES users(id)
    )
  `)

  // 迁移：todos 表补 user_id 列
  const todoCols = await db.all("PRAGMA table_info(todos)")
  if (!todoCols.some(col => col.name === 'user_id')) {
    await db.exec('ALTER TABLE todos ADD COLUMN user_id INTEGER REFERENCES users(id)')
  }

  // 迁移：users 表补 nickname / avatar_color / avatar 列
  const userCols = await db.all("PRAGMA table_info(users)")
  if (!userCols.some(col => col.name === 'nickname')) {
    await db.exec('ALTER TABLE users ADD COLUMN nickname TEXT DEFAULT NULL')
  }
  if (!userCols.some(col => col.name === 'avatar_color')) {
    await db.exec('ALTER TABLE users ADD COLUMN avatar_color TEXT DEFAULT NULL')
  }
  if (!userCols.some(col => col.name === 'avatar')) {
    await db.exec('ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL')
  }

  // 恢复上次登录的会话
  const row = await db.get("SELECT value FROM app_settings WHERE key = 'last_user_id'")
  if (row) {
    const uid = parseInt(row.value, 10)
    const user = await db.get('SELECT id, username, nickname, avatar_color, avatar, created_at FROM users WHERE id = ?', [uid])
    if (user) {
      currentUserId = user.id
    }
  }
}

// ==============================================
// 窗口创建
// ==============================================
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'G-Todo',
    icon: path.join(__dirname, 'Todo.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.setMenuBarVisibility(false)

  const devPath = path.join(__dirname, '..', 'react-demo', 'dist', 'index.html')
  const prodPath = path.join(__dirname, 'react-demo', 'dist', 'index.html')
  const htmlPath = fs.existsSync(devPath) ? devPath : prodPath
  win.loadFile(htmlPath)
}

// ==============================================
// 应用启动 — DB 初始化和窗口创建并行
// ==============================================
const dbReady = initDB()
registerIPC()

app.whenReady().then(() => {
  createWindow()
})

// ==============================================
// IPC 注册
// ==============================================
function registerIPC() {
  // ---------- 用户相关 ----------

  ipcMain.handle('user:register', async (_event, username, password) => {
    await dbReady
    if (!username || !password) return { error: '用户名和密码不能为空' }
    if (password.length < 6) return { error: '密码至少6位' }
    if (username.length < 2 || username.length > 20) return { error: '用户名长度2-20位' }

    const existing = await db.get('SELECT id FROM users WHERE username = ?', [username])
    if (existing) return { error: '用户名已存在' }

    const password_hash = hashPassword(password)
    const result = await db.run(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, password_hash]
    )
    const userId = result.lastID

    // 把旧的无主 todos 分配给第一个注册用户
    await db.run('UPDATE todos SET user_id = ? WHERE user_id IS NULL', [userId])

    // 持久化会话
    await db.run("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('last_user_id', ?)", [String(userId)])
    currentUserId = userId

    return { id: userId, username, nickname: null, avatar_color: null, avatar: null, created_at: new Date().toISOString() }
  })

  ipcMain.handle('user:login', async (_event, username, password) => {
    await dbReady
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username])
    if (!user) return { error: '用户不存在' }
    if (!verifyPassword(password, user.password_hash)) return { error: '密码错误' }

    await db.run("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('last_user_id', ?)", [String(user.id)])
    currentUserId = user.id

    return { id: user.id, username: user.username, nickname: user.nickname, avatar_color: user.avatar_color, avatar: user.avatar, created_at: user.created_at }
  })

  ipcMain.handle('user:logout', async () => {
    await dbReady
    await db.run("DELETE FROM app_settings WHERE key = 'last_user_id'")
    currentUserId = null
    return { success: true }
  })

  ipcMain.handle('user:current', async () => {
    await dbReady
    if (!currentUserId) return null
    const user = await db.get('SELECT id, username, nickname, avatar_color, avatar, created_at FROM users WHERE id = ?', [currentUserId])
    return user || null
  })

  ipcMain.handle('user:changePassword', async (_event, oldPassword, newPassword) => {
    await dbReady
    if (!currentUserId) return { error: '未登录' }
    if (!newPassword || newPassword.length < 6) return { error: '新密码至少6位' }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [currentUserId])
    if (!verifyPassword(oldPassword, user.password_hash)) return { error: '原密码错误' }

    const password_hash = hashPassword(newPassword)
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, currentUserId])
    return { success: true }
  })

  ipcMain.handle('user:updateProfile', async (_event, fields) => {
    await dbReady
    if (!currentUserId) return { error: '未登录' }

    const { nickname, avatar_color } = fields
    if (nickname !== undefined) {
      if (nickname && (nickname.length < 1 || nickname.length > 20)) return { error: '昵称长度1-20位' }
      await db.run('UPDATE users SET nickname = ? WHERE id = ?', [nickname || null, currentUserId])
    }
    if (avatar_color !== undefined) {
      await db.run('UPDATE users SET avatar_color = ? WHERE id = ?', [avatar_color || null, currentUserId])
    }

    const user = await db.get('SELECT id, username, nickname, avatar_color, avatar, created_at FROM users WHERE id = ?', [currentUserId])
    return user
  })

  ipcMain.handle('user:uploadAvatar', async () => {
    await dbReady
    if (!currentUserId) return { error: '未登录' }

    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: '选择头像',
      filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'] }],
      properties: ['openFile']
    })

    if (canceled || filePaths.length === 0) return { success: false, reason: 'canceled' }

    const filePath = filePaths[0]
    const ext = path.extname(filePath).toLowerCase().replace('.', '')
    const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp' }
    const mime = mimeMap[ext] || 'image/png'

    const buffer = fs.readFileSync(filePath)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${mime};base64,${base64}`

    // 限制 2MB
    if (dataUrl.length > 3 * 1024 * 1024) {
      return { error: '图片大小不能超过 2MB' }
    }

    await db.run('UPDATE users SET avatar = ? WHERE id = ?', [dataUrl, currentUserId])

    const user = await db.get('SELECT id, username, nickname, avatar_color, avatar, created_at FROM users WHERE id = ?', [currentUserId])
    return user
  })

  // ---------- Todo 相关（全部过滤 user_id）----------

  ipcMain.handle('todos:list', async () => {
    await dbReady
    if (!currentUserId) return []
    return db.all(`SELECT * FROM todos WHERE user_id = ? ORDER BY
      CASE priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      END, id`, [currentUserId])
  })

  ipcMain.handle('todos:add', async (_event, text, priority = 'medium') => {
    await dbReady
    if (!currentUserId) return { error: '未登录' }
    const result = await db.run(
      'INSERT INTO todos (text, priority, user_id) VALUES (?, ?, ?)',
      [text, priority, currentUserId]
    )
    return { id: result.lastID, text, priority, done: 0 }
  })

  ipcMain.handle('todos:delete', async (_event, id) => {
    await dbReady
    if (!currentUserId) return { error: '未登录' }
    await db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, currentUserId])
    return { success: true }
  })

  ipcMain.handle('todos:edit', async (_event, id, text, priority) => {
    await dbReady
    if (!currentUserId) return { error: '未登录' }
    await db.run('UPDATE todos SET text = ?, priority = ? WHERE id = ? AND user_id = ?',
      [text, priority, id, currentUserId])
    return { success: true }
  })

  ipcMain.handle('todos:toggle', async (_event, id) => {
    await dbReady
    if (!currentUserId) return { error: '未登录' }
    await db.run(
      'UPDATE todos SET done = CASE WHEN done = 0 THEN 1 ELSE 0 END WHERE id = ? AND user_id = ?',
      [id, currentUserId])
    return { success: true }
  })

  ipcMain.handle('todos:clear', async () => {
    await dbReady
    if (!currentUserId) return { error: '未登录' }
    await db.run('DELETE FROM todos WHERE user_id = ?', [currentUserId])
    return { success: true }
  })

  // ---------- 导出 ----------

  ipcMain.handle('export:todos', async (_event, format) => {
    await dbReady
    if (!currentUserId) return { error: '未登录' }

    const todos = await db.all(
      'SELECT id, text, done, priority FROM todos WHERE user_id = ? ORDER BY id',
      [currentUserId]
    )

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: '导出任务',
      defaultPath: `todos-${Date.now()}.${format}`,
      filters: [
        format === 'json'
          ? { name: 'JSON', extensions: ['json'] }
          : { name: 'CSV', extensions: ['csv'] }
      ]
    })

    if (canceled || !filePath) return { success: false, reason: 'canceled' }

    let content
    if (format === 'json') {
      content = JSON.stringify(todos, null, 2)
    } else {
      const header = 'id,text,done,priority'
      const rows = todos.map(t => `${t.id},"${t.text}",${t.done},${t.priority}`)
      content = '﻿' + header + '\n' + rows.join('\n')
    }

    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  })
}

app.on('window-all-closed', () => {
  app.quit()
})
