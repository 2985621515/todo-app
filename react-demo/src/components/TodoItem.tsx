import { useState } from "react"
import { observer } from "mobx-react-lite"
import todoStore from "../store/todoStore"
import type { Todo } from "../types/todo"
import { Select, Space, Tag, List, Button, Checkbox, Modal, Input, Popconfirm, Form, DatePicker } from "antd"
import dayjs from "dayjs"

type Props = {
  todo: Todo
}

function formatDueDate(date: string | null) {
  if (!date) return null
  const d = dayjs(date)
  const now = dayjs()
  const today = now.startOf('day')
  const target = d.startOf('day')
  const diff = target.diff(today, 'day')
  const timeStr = d.format('HH:mm')
  const isOverdue = d.isBefore(now)

  if (diff < 0) return { text: `逾期 ${Math.abs(diff)} 天`, overdue: true }
  if (diff === 0) {
    if (isOverdue) return { text: `今天 ${timeStr}（已过期）`, overdue: true }
    return { text: `今天 ${timeStr}`, overdue: false }
  }
  if (diff === 1) return { text: `明天 ${timeStr}`, overdue: false }
  if (diff <= 7) return { text: `${diff} 天后 ${timeStr}`, overdue: false }
  return { text: d.format('MM-DD HH:mm'), overdue: false }
}

function TodoItem({ todo }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const dueInfo = formatDueDate(todo.due_date)
  const isOverdue = dueInfo?.overdue && !todo.done

  const handleEdit = () => {
    form.setFieldsValue({
      text: todo.text,
      priority: todo.priority,
      dueDate: todo.due_date ? dayjs(todo.due_date) : null,
    })
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const dueDate = values.dueDate ? values.dueDate.format('YYYY-MM-DD HH:mm') : null
      todoStore.editTodo(todo.id, values.text, values.priority, dueDate)
      setIsModalOpen(false)
    } catch {
      // 校验失败
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <List.Item
        style={{
          borderRadius: 8,
          transition: "background 0.2s, box-shadow 0.2s",
          cursor: "default",
          borderLeft: `4px solid ${
            todo.done
              ? "#d9d9d9"
              : todo.priority === "high"
              ? "#E53E3E"
              : todo.priority === "medium"
              ? "#F59E0B"
              : "#10b92c"
          }`,
          marginBottom: 4,
          background: isOverdue ? "#fff1f0" : todo.done ? "#fafafa" : "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isOverdue ? "#ffe7e5" : "#fafafa"
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isOverdue ? "#fff1f0" : todo.done ? "#fafafa" : "transparent"
          e.currentTarget.style.boxShadow = "none"
        }}
        actions={[
          <Button type="link" onClick={handleEdit}>
            编辑
          </Button>,

          <Popconfirm
            title="确认删除这个任务吗？"
            onConfirm={() => todoStore.deleteTodo(todo.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button danger>删除</Button>
          </Popconfirm>
        ]}
      >
        <Checkbox
          checked={todo.done}
          onChange={() => todoStore.toggleTodo(todo.id)}
        >
          <Space>
            <Tag color={todo.priority === "high" ? "red" : todo.priority === "medium" ? "orange" : "green"}>
              {todo.priority === "high" ? "高" : todo.priority === "medium" ? "中" : "低"}
            </Tag>
            <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
              {todo.text}
            </span>
            {todo.due_date && (
              <span style={{
                fontSize: 12,
                color: isOverdue ? "#E53E3E" : "#999",
                fontWeight: isOverdue ? 600 : 400,
              }}>
                {dueInfo?.text}
              </span>
            )}
          </Space>
        </Checkbox>
      </List.Item>

      <Modal
        title="编辑任务"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="text"
            label="任务内容"
            rules={[
              { required: true, message: "请输入任务内容" }
            ]}
          >
            <Input placeholder="请输入任务内容" />
          </Form.Item>

          <Form.Item name="dueDate" label="截止时间">
            <DatePicker showTime={{ format: 'HH:mm' }} style={{ width: '100%' }} allowClear />
          </Form.Item>

          <Form.Item name="priority" label="优先级">
            <Select
              options={[
                { value: "high", label: "高" },
                { value: "medium", label: "中" },
                { value: "low", label: "低" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default observer(TodoItem)
