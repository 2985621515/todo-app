import { observer } from "mobx-react-lite"
import todoStore from "./store/todoStore"
import TodoInput from "./components/TodoInput"
import TodoList from "./components/TodoList"
import { Progress } from "antd"

const App = observer(() => {
  const total = todoStore.list.length
  const done = todoStore.list.filter(t => t.done).length

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
      {/* 头部渐变色横幅 */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 16,
          padding: "32px 28px",
          marginBottom: 24,
          color: "#fff",
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#fff" }}>
          我的待办
        </h1>
        <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 14 }}>
          共 {total} 项 · 已完成 {done} 项
        </p>
        <Progress
          percent={total ? Math.round((done / total) * 100) : 0}
          showInfo={false}
          size="small"
          strokeColor="#fff"
          trailColor="rgba(255,255,255,0.3)"
          style={{ marginTop: 12 }}
        />
      </div>

      {/* 白色卡片 */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <TodoInput />
        <TodoList />
      </div>
    </div>
  )
})

export default App
