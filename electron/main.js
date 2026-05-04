const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// 设置数据库路径到用户数据目录
const dbPath = path.join(app.getPath('userData'), 'database.sqlite')

// 指定可写的缓存目录
app.setPath('cache', path.join(app.getPath('userData'), 'Cache'))

// ==============================================
// SQLite 数据库初始化
// ==============================================
let db

async function initDB() {
  const sqlite3 = require('sqlite3')
  const { open } = require('sqlite')

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium'
    )
  `)
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

// IPC 处理器内部等待 DB 就绪
function registerIPC() {
  ipcMain.handle('todos:list', async () => {
    await dbReady
    return db.all(`SELECT * FROM todos ORDER BY
      CASE priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      END, id`)
  })

  ipcMain.handle('todos:add', async (_event, text, priority = 'medium') => {
    await dbReady
    const result = await db.run(
      'INSERT INTO todos (text, priority) VALUES (?, ?)',
      [text, priority]
    )
    return { id: result.lastID, text, priority, done: 0 }
  })

  ipcMain.handle('todos:delete', async (_event, id) => {
    await dbReady
    await db.run('DELETE FROM todos WHERE id = ?', [id])
    return { success: true }
  })

  ipcMain.handle('todos:edit', async (_event, id, text, priority) => {
    await dbReady
    await db.run('UPDATE todos SET text = ?, priority = ? WHERE id = ?', [text, priority, id])
    return { success: true }
  })

  ipcMain.handle('todos:toggle', async (_event, id) => {
    await dbReady
    await db.run(
      'UPDATE todos SET done = CASE WHEN done = 0 THEN 1 ELSE 0 END WHERE id = ?',
      [id]
    )
    return { success: true }
  })

  ipcMain.handle('todos:clear', async () => {
    await dbReady
    await db.run('DELETE FROM todos')
    return { success: true }
  })
}

app.on('window-all-closed', () => {
  app.quit()
})
