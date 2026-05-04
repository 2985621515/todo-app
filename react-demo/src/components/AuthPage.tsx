import { useState } from "react"
import { observer } from "mobx-react-lite"
import { Tabs, Form, Input, Button, message } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import userStore from "../store/userStore"

const AuthPage = observer(() => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true)
    const error = await userStore.login(values.username, values.password)
    setLoading(false)
    if (error) {
      messageApi.error(error)
    }
  }

  const handleRegister = async (values: { username: string; password: string }) => {
    setLoading(true)
    const error = await userStore.register(values.username, values.password)
    setLoading(false)
    if (error) {
      messageApi.error(error)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {contextHolder}
      <div
        style={{
          width: 400,
          background: "#fff",
          borderRadius: 16,
          padding: "40px 32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            G
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>G-Todo</h1>
          <p style={{ color: "#999", marginTop: 4 }}>高效管理你的每一天</p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key as "login" | "register")
            loginForm.resetFields()
            registerForm.resetFields()
          }}
          centered
          items={[
            {
              key: "login",
              label: "登录",
              children: (
                <Form form={loginForm} onFinish={handleLogin} layout="vertical" style={{ marginTop: 8 }}>
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: "请输入用户名" },
                      { min: 2, message: "用户名至少2位" },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: "请输入密码" }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "register",
              label: "注册",
              children: (
                <Form form={registerForm} onFinish={handleRegister} layout="vertical" style={{ marginTop: 8 }}>
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: "请输入用户名" },
                      { min: 2, message: "用户名至少2位" },
                      { max: 20, message: "用户名最多20位" },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "请输入密码" },
                      { min: 6, message: "密码至少6位" },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "请确认密码" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error("两次输入的密码不一致"))
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                      注册
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
})

export default AuthPage
