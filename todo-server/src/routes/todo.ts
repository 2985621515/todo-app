import express from "express"
import pool from "../db"

const router = express.Router()

// 获取列表
router.get("/", async (req, res) => {
  const [rows] = await pool.query("select * from todos")//只接受第一个参数，即返回的结果集，忽略第二个fields参数
  res.json(rows)//作用：将查询结果转换为 JSON 格式并发送给客户端
})

// 添加
router.post("/", async (req, res) => {
  // 从请求体中提取 text 字段
  const { text } = req.body

  // SQL 语句：将 text 字段插入 todos 表中
  const [result]: any = await pool.query(
    "insert into todos (text) values (?)",
    [text]
  )

  // 返回添加的 todo 信息
  res.json({
    id: result.insertId,
    text
  })
})

// 删除
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  await pool.query("delete from todos where id = ?", [id])

  res.json({ success: true })
})

// 编辑
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { text } = req.body

  await pool.query("update todos set text = ? where id = ?", [
    text,
    id
  ])

  res.json({ success: true })
})

// 切换状态
router.patch("/:id", async (req, res) => {
  const { id } = req.params

  await pool.query(
    "update todos set done = not done where id = ?",
    [id]
  )

  res.json({ success: true })
})

// 清空
router.delete("/", async (req, res) => {
  await pool.query("delete from todos")
  res.json({ success: true })
})

export default router