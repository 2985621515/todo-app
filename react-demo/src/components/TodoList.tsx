import { observer } from "mobx-react-lite"
import todoStore from "../store/todoStore"
import TodoItem from "./TodoItem"
import { List, Empty, Popconfirm, Button, Tabs} from "antd"
import { useEffect } from "react"


function TodoList() {

  useEffect(() => {
    todoStore.fetchTodos()
  }, [])

  if (todoStore.filteredList.length === 0) {
    return (
  <>
    <Tabs
      activeKey={todoStore.filter}
      onChange={(key) => todoStore.setFilter(key as "all" | "active" | "completed")}
      items={[
        { key: "all", label: "全部" },
        { key: "active", label: "未完成" },
        { key: "completed", label: "已完成" },
      ]}
    />
    <div style={{ marginBottom: 16, textAlign: "right" }}>
      <Popconfirm
        title="确认清空所有任务吗？"
        onConfirm={() => todoStore.clearTodos()}
        okText="确认"
        cancelText="取消"
      >
        <Button danger>清空任务</Button>
      </Popconfirm>
    </div>
    {todoStore.filteredList.length === 0 ? (
      <Empty description="暂无任务" />
    ) : (
      <List
        bordered
        dataSource={todoStore.filteredList}
        renderItem={(item) => (
          <TodoItem key={item.id} todo={item} />
        )}
      />
    )}
  </>
)

  }

  return (
    <>
    <Tabs
      activeKey={todoStore.filter}
      onChange={(key) => todoStore.setFilter(key as "all" | "active" | "completed")}
      items={[
        { key: "all", label: "全部" },
        { key: "active", label: "未完成" },
        { key: "completed", label: "已完成" },
      ]}
    />

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
      dataSource={todoStore.filteredList}
      renderItem={(item) => (// 渲染每个任务项
        <TodoItem key={item.id} todo={item} />
      )}
    />
    </>
  )
}

export default observer(TodoList)