# Architecture

## 设计来源（调研结论）

| 模块 | 参考项目 | 关键取舍 |
|---|---|---|
| 模型 Provider 抽象 | Dify / LibreChat | OpenAI 兼容优先 + 各家原生适配 |
| 包/工具系统 | n8n / Dify / Operit | manifest + JSON Schema + 统一代理路由 + 权限声明 |
| 控制台 ↔ Agent Server 解耦 | OpenHands Agent Canvas | 前端只管渲染，运行时服务化 |
| 角色卡 V2 兼容 | SillyTavern | 数据格式兼容社区，不复制 AGPL 代码 |
| 记忆分层 | Letta | 常驻上下文 + 检索 + 快照/归档 |
| 沙盒执行 | LibreChat code-interpreter / OpenHands | Docker 隔离 + 用户确认 |

## 系统分层

```
[RN App]  [Web Admin]  [CLI(可选)]
    \        |          /
     REST / SSE / WebSocket
              |
    [API Gateway · JWT · 限流]
              |
    [应用服务层]
      Chat/Conversation
      Agent Runtime (loop/子agent)
      Tool/Plugin Registry (包系统)
      Character Engine (角色卡+分段分句)
      Memory Service
      Workflow Service
      Media / Search / File / Sandbox
              |
   PostgreSQL · Redis/BullMQ · 向量库 · Docker
```

## 包系统（核心机制）

1. 包 = `manifest`（名称/描述/依赖/权限声明）+ 工具定义（name + description + 参数 JSON Schema）+ 实现
2. `use_package` 激活 → 工具进入可见集
3. 统一代理路由（`packageName:toolName`）→ 权限拦截 / 限流 / 审计
4. 权限分域：文件 / 网络 / 终端 / 系统操作，运行时二次确认

## 角色卡引擎

- Character Card V2 兼容模型（name/persona/scenario/first_mes/mes_example/世界书/系统提示）
- 会话绑定 + 导入导出（兼容社区卡）
- 提示词组装：system + 角色设定 + 历史 + 世界书检索 + 记忆注入
- **分段分句管道**：流式 token → 分句切分 → 节奏控制 → 分段下发 → 打字动画
- 情感状态机：情绪追踪 / 亲密度 / 主动行为触发

## 里程碑

- Phase 0 脚手架（当前）
- Phase 1 RN 聊天核心 + 认证 + SSE 流式 + 模型层
- Phase 2 工具系统 + 包系统骨架
- Phase 3 角色卡引擎 + 分段分句回复
- Phase 4 记忆 + 情感状态机
- Phase 5 Agent Runtime
- Phase 6 世界书 / TTS / 角色卡市场 / 管理后台
