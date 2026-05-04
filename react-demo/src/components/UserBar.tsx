import { useState } from "react"
import { observer } from "mobx-react-lite"
import { Button, Space, Dropdown, message } from "antd"
import { ExportOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons"
import userStore from "../store/userStore"
import todoStore from "../store/todoStore"
import { exportTodos } from "../api/electron"
import UserSettings from "./UserSettings"

const UserBar = observer(() => {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const handleLogout = async () => {
    await userStore.logout()
    todoStore.reset()
  }

  const handleExport = async (format: "json" | "csv") => {
    const result = await exportTodos(format)
    if (result.success) {
      messageApi.success(`导出成功`)
    }
    // canceled 时不提示
  }

  const exportItems = [
    { key: "json", label: "导出 JSON", onClick: () => handleExport("json") },
    { key: "csv", label: "导出 CSV", onClick: () => handleExport("csv") },
  ]

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Space>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              overflow: "hidden",
              background: userStore.currentUser?.avatar ? "transparent" : userStore.getAvatarColor(),
            }}
          >
            {userStore.currentUser?.avatar ? (
              <img
                src={userStore.currentUser.avatar}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                {userStore.getInitial()}
              </span>
            )}
          </div>
          <span style={{ fontWeight: 500, fontSize: 15 }}>
            {userStore.displayName}
          </span>
        </Space>

        <Space>
          <Dropdown menu={{ items: exportItems }} placement="bottomRight">
            <Button icon={<ExportOutlined />}>导出</Button>
          </Dropdown>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setSettingsOpen(true)}
          >
            设置
          </Button>
          <Button
            icon={<LogoutOutlined />}
            danger
            onClick={handleLogout}
          >
            退出
          </Button>
        </Space>
      </div>

      <UserSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
})

export default UserBar
