import axios from "axios"

// 创建实例
const request = axios.create({
  baseURL: "http://localhost:3000", // 后端地址
  timeout: 5000
})

export default request