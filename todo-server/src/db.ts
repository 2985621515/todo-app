import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "path"

// 打开数据库连接（如果文件不存在会自动创建）
const dbPromise = open({
  filename: path.join(__dirname, "database.sqlite"), // 数据库文件存放路径
  driver: sqlite3.Database
})

// 初始化数据库表（如果不存在则创建）
async function initDB() {
  const db = await dbPromise
  await db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    )
  `)
}

initDB()

export default dbPromise