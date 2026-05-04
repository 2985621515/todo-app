# G-Todo 构建指南

## 技术架构

- **前端**: React + Vite + MobX + Ant Design（渲染进程）
- **通信**: Electron IPC（`contextBridge` + `ipcRenderer.invoke`）
- **存储**: SQLite（`sqlite` + `sqlite3`，运行在主进程）
- **打包**: electron-builder（`portable` 单文件 .exe）

## 前置要求

- 安装 Node.js

## 构建步骤

```bash
# 1. 构建前端
cd react-demo
npm install
npm run build

# 2. 打包桌面应用
cd ../electron
npm install
npm run build
```

## 产出

打包完成后，`electron/dist/` 目录下会生成 `G-Todo.exe`。

## 开发模式

```bash
# 终端 1 — 前端热更新
cd react-demo
npm run dev

# 终端 2 — 启动 Electron 加载前端
cd electron
npx electron .
```
