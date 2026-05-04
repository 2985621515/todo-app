import { useState } from "react"
import { observer } from "mobx-react-lite"
import todoStore from "../store/todoStore"
import { Input, Button, Space, Select, DatePicker } from "antd"
import type { Priority } from "../types/todo"
import dayjs from "dayjs"

function TodoInput() {
  const [text, setText] = useState("")
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState<string | null>(null)

  const handleAdd = () => {
    todoStore.addTodo(text, priority, dueDate)
    setText("")
    setDueDate(null)
  }

  return (
    <Space style={{ marginBottom: 16 }}>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="请输入任务"
        onPressEnter={handleAdd}
      />

      <DatePicker
        showTime={{ format: 'HH:mm' }}
        value={dueDate ? dayjs(dueDate) : null}
        onChange={(d) => setDueDate(d ? d.format('YYYY-MM-DD HH:mm') : null)}
        placeholder="截止时间"
        style={{ width: 180 }}
        allowClear
      />

      <Select
        value={priority}
        onChange={setPriority}
        style={{ width: 120 }}
        options={[
          { value: "high", label: "Urgent" },
          { value: "medium", label: "Normal" },
          { value: "low", label: "Minor" },
        ]}
        optionRender={(option) => (
          <Space>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  option.data.value === "high"
                    ? "#E53E3E"
                    : option.data.value === "medium"
                    ? "#F59E0B"
                    : "#10b92c",
              }}
            />
            {option.data.label}
          </Space>
        )}
      />

      <Button type="primary" onClick={handleAdd}>
        添加
      </Button>
    </Space>
  )
}

export default observer(TodoInput)
