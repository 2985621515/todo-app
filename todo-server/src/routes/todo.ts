import express from "express"
import dbPromise from "../db"

const router = express.Router()

// 获取列表
router.get("/", async (req, res) => {
  const db = await dbPromise
  const rows = await db.all(`select * from todos order by
    case priority
    when 'high' then 1
    when 'medium' then 2
    when 'low' then 3
    end, id`)
  res.json(rows)
})

// 添加
router.post("/", async (req, res) => {
  const { text, priority = "medium" } = req.body
  const db = await dbPromise

  const result = await db.run(
    "insert into todos (text, priority) VALUES (?,?)",
    [text, priority]
  )

  // SQLite 中获取最后插入的ID：result.lastID
  res.json({
    id: result.lastID,
    text,
    priority,
    done: 0
  })
})

// 删除
router.delete("/:id", async (req, res) => {
  const { id } = req.params
  const db = await dbPromise
  
  await db.run("DELETE FROM todos WHERE id = ?", [id])
  res.json({ success: true })
})

// 编辑
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { text, priority } = req.body
  const db = await dbPromise
  
  await db.run("UPDATE todos SET text = ?, priority = ? WHERE id = ?", [text, priority, id])
  res.json({ success: true })
})

// 切换状态
router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const db = await dbPromise
  
  // SQLite 使用 CASE WHEN 来切换 0/1
  await db.run(
    "UPDATE todos SET done = CASE WHEN done = 0 THEN 1 ELSE 0 END WHERE id = ?",
    [id]
  )
  res.json({ success: true })
})

// 清空
router.delete("/", async (req, res) => {
  const db = await dbPromise
  
  await db.run("DELETE FROM todos")
  res.json({ success: true })
})

export default router