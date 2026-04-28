import { useState } from "react"
import { observer } from "mobx-react-lite"
import todoStore from "../store/todoStore"
import {Input,Button,Space} from "antd"

function TodoInput() {
  const [text, setText] = useState("")// 临时存储用户输入的任务文本

  const handleAdd = () => {
    todoStore.addTodo(text)// 调用todoStore的addTodo方法添加新任务
    setText("")// 清空输入框
  }

  return (
    <Space style={{ marginBottom: 16 }}>
      <Input
        value={text}
        // onChange 事件处理函数，用于更新输入框的值
        // 当用户输入内容时，更新text状态变量
        // e.target.value：获取输入框当前的文本值
        // e.target：事件触发的元素，这里指输入框
        onChange={(e) => setText(e.target.value)}
        placeholder="请输入任务"
        onPressEnter={handleAdd}// 按下Enter键时触发添加任务
      />

      <Button type="primary" onClick={handleAdd}>
        添加
      </Button>
    </Space>
  )
}


export default observer(TodoInput)