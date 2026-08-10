# Operit-like

AI 助手平台（开发代号）：**Android 优先（React Native）+ TypeScript 全栈**，核心特色为**角色卡（Character Card）与虚拟恋人引擎**。

> 参考调研：Dify / LibreChat / OpenHands / n8n / SillyTavern（Character Card V2）等 25+ 开源项目，设计取舍见 `docs/architecture.md`。

## 技术栈

| 层 | 选型 |
|---|---|
| 客户端 | React Native (Expo) + TypeScript |
| Web 后台 | Next.js (管理端/角色卡市场) |
| 后端 | NestJS + PostgreSQL + Redis + BullMQ |
| Agent | 自研轻量运行时 + 工具/包系统 |
| 沙盒 | Docker 隔离代码执行 |
| 部署 | Docker Compose（阿里云 ECS） |

## 仓库结构

```
apps/
  mobile/     React Native App（Android 优先）
  server/     NestJS 后端
  web/        Next.js 管理后台
packages/
  shared/             共享类型（工具 schema / 角色卡 / 消息协议）
  tool-registry/      工具与包系统
  character-engine/   角色卡 & 虚拟恋人引擎
  agent-runtime/      Agent 循环
```

## 开发

```bash
pnpm install
pnpm dev
```

## 许可证

Apache-2.0（详见 LICENSE）
