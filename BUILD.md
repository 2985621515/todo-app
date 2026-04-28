# 构建指南

## 前置要求
- 安装 Node.js

## 构建步骤

```bash
# 1. 构建前端
cd react-demo
npm install
npm run build

# 2. 编译后端
cd ../todo-server
npm install
npx tsc

# 3. 打包桌面应用
cd ../electron
npm install
npx electron-builder build
```

打包完成后，`electron/dist/` 目录下会生成 `Todo应用-1.0.0.exe`。
