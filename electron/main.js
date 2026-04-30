const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

// 设置环境变量，告诉后端是被 Electron 启动的（不要自己调用 app.listen）
process.env.ELECTRON_RUN = 'true'

// 设置数据库路径到用户数据目录（保证安装后也能正常读写）
const dbPath = path.join(app.getPath('userData'), 'database.sqlite')
process.env.DB_PATH = dbPath

// 指定可写的缓存目录，消除 "Unable to create cache" 警告并加速渲染进程启动
app.setPath('cache', path.join(app.getPath('userData'), 'Cache'))

// 启动后端服务器，然后创建窗口
app.whenReady().then(() => {
  // 先创建窗口，让用户立即看到界面
  const win = createWindow()

  // 延迟加载后端服务（不阻塞窗口显示）
  setImmediate(async () => {
    try {
      const devServerDir = path.join(__dirname, '..', 'todo-server', 'dist')
      const prodServerDir = path.join(__dirname, 'todo-server', 'dist')
      const serverDir = fs.existsSync(devServerDir) ? devServerDir : prodServerDir

      // 打包后优先加载 bundle.js（esbuild 打包，减少 require 解析开销）
      const serverEntry = fs.existsSync(path.join(serverDir, 'bundle.js'))
        ? path.join(serverDir, 'bundle.js')
        : path.join(serverDir, 'index.js')

      // 开发模式：让原生模块使用 electron/node_modules（已为 Electron 编译）
      if (devServerDir === serverDir) {
        const Module = require('module')
        const electronModulesDir = path.join(__dirname, 'node_modules')
        const origResolveFilename = Module._resolveFilename
        Module._resolveFilename = function(request, parent, ...args) {
          if ((request === 'sqlite3' || request === 'sqlite') &&
              parent && parent.filename && parent.filename.startsWith(serverDir)) {
            const electronPath = path.join(electronModulesDir, request)
            if (fs.existsSync(electronPath)) {
              return origResolveFilename.call(this, electronPath, parent, ...args)
            }
          }
          return origResolveFilename.call(this, request, parent, ...args)
        }
      }

      const { startServer } = require(serverEntry)
      await startServer(3000)
    } catch (err) {
      console.error('启动失败:', err)
      const { dialog } = require('electron')
      dialog.showErrorBox('启动失败', err.message + '\n\n' + err.stack)
    }
  })
})


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
      contextIsolation: true
    }
  })

  win.setMenuBarVisibility(false)

  // 兼容开发环境（react-demo 是同级目录）和打包后（被复制到 electron 内）
  const devPath = path.join(__dirname, '..', 'react-demo', 'dist', 'index.html')
  const prodPath = path.join(__dirname, 'react-demo', 'dist', 'index.html')
  const htmlPath = fs.existsSync(devPath) ? devPath : prodPath
  win.loadFile(htmlPath)
}

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  app.quit()
})
