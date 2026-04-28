import express from "express"
import cors from "cors"
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

// 启动服务
app.listen(3000, () => {
  console.log("服务器启动：http://localhost:3000")
})