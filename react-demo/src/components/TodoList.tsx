import { observer } from "mobx-react-lite"
import todoStore from "../store/todoStore"
import TodoItem from "./TodoItem"
import { List, Empty, Popconfirm, Button } from "antd"
import { useEffect } from "react"


function TodoList() {

  useEffect(() => {
    todoStore.fetchTodos()
  }, [])

  if (todoStore.list.length === 0) {
    return <Empty description="暂无任务" />
  }

  return (
    <>{/* 清空按钮 */}
    <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Popconfirm                   // 确认弹窗
          title="确认清空所有任务吗？"
          onConfirm={() => todoStore.clearTodos()}
          okText="确认" // 确认按钮文本
          cancelText="取消" // 取消按钮文本
        >
          <Button danger>清空任务</Button>
        </Popconfirm>
      </div>
    <List
      bordered 
      dataSource={todoStore.list}
      renderItem={(item) => (// 渲染每个任务项
        <TodoItem key={item.id} todo={item} />
      )}
    />
    </>
  )
}

export default observer(TodoList)