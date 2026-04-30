import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "path"

// 打开数据库连接（如果文件不存在会自动创建）
const dbPromise = open({
  filename: process.env.DB_PATH || path.join(__dirname, "database.sqlite"), // 数据库文件存放路径
  driver: sqlite3.Database
})

// 初始化数据库表（如果不存在则创建）
async function initDB() {
  const db = await dbPromise
  await db.exec(`
    create table if not exists todos (
      id integer primary key autoincrement,
      text text not null,
      done integer not null default 0,
      priority text not null default 'medium'
    )
  `)
}

initDB().catch(err => {
  console.error("数据库初始化失败:", err)
})

export default dbPromise



