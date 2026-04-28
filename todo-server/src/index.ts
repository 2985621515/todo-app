import express from "express"
import cors from "cors"
import path from "path"
import todoRouter from "./routes/todo"

const app = express()
// use:中间件的使用
// 允许跨域
app.use(cors())
// 解析 JSON
// 作用是将请求体中的 JSON 字符串解析为 JavaScript 对象
app.use(express.json())

// 路由
app.use("/todos", todoRouter)

// 提供前端静态文件（在 Electron 中展示页面用的）
const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, "../../react-demo/dist")
console.log("前端文件路径：", frontendPath)
app.use(express.static(frontendPath))

// 启动服务（仅直接运行时，被 Electron 导入时不自动启动）
if (!process.env.ELECTRON_RUN) {
  app.listen(3000, () => {
    console.log("服务器启动：http://localhost:3000")
  })
}

export { app }
export function startServer(port = 3000) {
  return new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`服务器启动：http://localhost:${port}`)
      resolve()
    })
  })
}