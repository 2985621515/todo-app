import TodoInput from "./components/TodoInput"
import TodoList from "./components/TodoList"
import { Card } from "antd"

function App() {
  return (
    <div style={{ width: 500, margin: "50px auto" }}>
      <Card title="任务管理（Todo App）">
        <TodoInput />
        <TodoList />
      </Card>
    </div>
  )
}

export default App