import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "guangod54188",
  database: "todo_db"
})

export default pool