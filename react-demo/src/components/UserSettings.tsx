import { Modal, Form, Input, Tabs, Button, message } from "antd"
import { UploadOutlined } from "@ant-design/icons"
import userStore from "../store/userStore"

type Props = {
  open: boolean
  onClose: () => void
}

function UserSettings({ open, onClose }: Props) {
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()

  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields()
      const error = await userStore.updateProfile({
        nickname: values.nickname || null,
      })
      if (error) {
        messageApi.error(error)
        return
      }
      messageApi.success("资料已更新")
    } catch {
      // 校验失败
    }
  }

  const handleUploadAvatar = async () => {
    const error = await userStore.uploadAvatar()
    if (error) {
      messageApi.error(error)
    } else if (userStore.currentUser?.avatar) {
      messageApi.success("头像已更新")
    }
  }

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      const error = await userStore.changePassword(values.oldPassword, values.newPassword)
      if (error) {
        messageApi.error(error)
        return
      }
      messageApi.success("密码修改成功")
      passwordForm.resetFields()
    } catch {
      // 校验失败
    }
  }

  const handleCancel = () => {
    profileForm.resetFields()
    passwordForm.resetFields()
    onClose()
  }

  const avatarUrl = userStore.currentUser?.avatar

  return (
    <>
      {contextHolder}
      <Modal
        title="用户设置"
        open={open}
        onOk={undefined}
        onCancel={handleCancel}
        footer={null}
        width={440}
      >
        <Tabs
          defaultActiveKey="profile"
          items={[
            {
              key: "profile",
              label: "个人资料",
              children: (
                <Form
                  form={profileForm}
                  layout="vertical"
                  initialValues={{
                    nickname: userStore.currentUser?.nickname || '',
                  }}
                >
                  {/* 头像预览 */}
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        margin: "0 auto 12px",
                        overflow: "hidden",
                        background: avatarUrl ? "transparent" : userStore.getAvatarColor(),
                      }}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="头像"
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
                            fontSize: 32,
                            fontWeight: 600,
                          }}
                        >
                          {userStore.getInitial()}
                        </span>
                      )}
                    </div>
                    <Button
                      icon={<UploadOutlined />}
                      onClick={handleUploadAvatar}
                      size="small"
                    >
                      上传头像
                    </Button>
                  </div>

                  <Form.Item
                    name="nickname"
                    label="昵称"
                    rules={[
                      { max: 20, message: "昵称最多20位" },
                    ]}
                  >
                    <Input placeholder="留空则显示用户名" />
                  </Form.Item>
                  <Form.Item>
                    <button
                      type="button"
                      onClick={handleUpdateProfile}
                      style={{
                        width: '100%',
                        padding: '8px 0',
                        border: 'none',
                        borderRadius: 6,
                        background: '#1677ff',
                        color: '#fff',
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      保存资料
                    </button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "password",
              label: "修改密码",
              children: (
                <Form form={passwordForm} layout="vertical">
                  <Form.Item
                    name="oldPassword"
                    label="原密码"
                    rules={[{ required: true, message: "请输入原密码" }]}
                  >
                    <Input.Password placeholder="请输入原密码" />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                      { required: true, message: "请输入新密码" },
                      { min: 6, message: "密码至少6位" },
                    ]}
                  >
                    <Input.Password placeholder="请输入新密码" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="确认新密码"
                    dependencies={["newPassword"]}
                    rules={[
                      { required: true, message: "请确认新密码" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("newPassword") === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error("两次输入的密码不一致"))
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="请确认新密码" />
                  </Form.Item>
                  <Form.Item>
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      style={{
                        width: '100%',
                        padding: '8px 0',
                        border: 'none',
                        borderRadius: 6,
                        background: '#1677ff',
                        color: '#fff',
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      修改密码
                    </button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </>
  )
}

export default UserSettings
