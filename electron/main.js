const { app, BrowserWindow } = require('electron')
const path = require('path')

// 设置环境变量，告诉后端是被 Electron 启动的（不要自己调用 app.listen）
process.env.ELECTRON_RUN = 'true'

// 设置数据库路径到用户数据目录（保证安装后也能正常读写）
const dbPath = path.join(app.getPath('userData'), 'database.sqlite')
process.env.DB_PATH = dbPath

// 启动后端服务器，然后创建窗口
app.whenReady().then(async () => {
  try {
    // 导入编译后的后端代码
    // __dirname 指向 main.js 所在的目录（打包后就是这个目录）
    const serverDir = path.join(__dirname, 'todo-server', 'dist')
    const { startServer } = require(path.join(serverDir, 'index.js'))

    // 等待服务器就绪
    await startServer(3000)

    // 服务器启动完毕，创建窗口
    createWindow()
  } catch (err) {
    // 如果有错误，弹出对话框显示，而不是悄无声息地崩溃
    const { dialog } = require('electron')
    dialog.showErrorBox('启动失败', err.message + '\n\n' + err.stack)
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'G-Todo',
    icon: path.join(__dirname, 'Todo.ico'), 
    
    // nodeIntegration: false, 禁用 Node.js 集成，防止前端代码访问 Node.js API
    // contextIsolation: true, 启用上下文隔离，防止前端代码访问 Node.js 进程的全局对象
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // 隐藏菜单栏
  win.setMenuBarVisibility(false)

  // 直接加载前端页面文件
  win.loadFile(path.join(__dirname, 'react-demo', 'dist', 'index.html'))
}

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  app.quit()
})
