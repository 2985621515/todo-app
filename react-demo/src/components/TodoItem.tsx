import { useState } from "react"
import { observer } from "mobx-react-lite"
import todoStore from "../store/todoStore"
import type { Todo } from "../types/todo"
import { List, Button, Checkbox, Modal, Input, Popconfirm, Form } from "antd"


type Props = {
  todo: Todo
}

function TodoItem({ todo }: Props) {
  // 编辑任务的 Modal 状态
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // 编辑任务的 Form 实例
  const [form] = Form.useForm()

  // 编辑任务的 Modal 打开，初始化表单字段值为当前任务的文本
  const handleEdit = () => { 
    form.setFieldsValue({
      text: todo.text
    })
    setIsModalOpen(true)
  }

  // 编辑任务的 Modal 确认
  // 当用户点击保存按钮时，触发
  // 校验表单数据，如果校验通过，提交表单数据
  const handleOk = async () => {
    try {
      const values = await form.validateFields()// validateFields()方法会返回一个Promise对象

      todoStore.editTodo(todo.id, values.text)

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
          <span
            style={{
              textDecoration: todo.done ? "line-through" : "none"
            }}
          >
            {todo.text}
          </span>
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
          
        </Form>
      </Modal>
    </>
  )
}

export default observer(TodoItem)