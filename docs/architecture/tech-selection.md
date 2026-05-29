# 技术选型说明 — Pro-OW

> 版本: v1.0 | 日期: 2026-05-29

---

## 一、选型总览

| 层 | 技术 | 版本 | 选型理由 |
|---|---|---|---|
| 前端框架 | React | 18+ | 生态最丰富，社区最大，SSR 支持好 |
| 构建工具 | Vite | 5+ | 开发启动秒级，HMR 极致体验 |
| CSS 方案 | Tailwind CSS | 3+ | 原子化 CSS，开发效率极高，包体积小 |
| UI 组件库 | shadcn/ui | latest | 无包依赖，源码级定制，设计精美 |
| 后端框架 | NestJS | 10+ | 企业级 Node.js 框架，依赖注入、模块化、微服务原生支持 |
| AI 服务 | FastAPI | 0.110+ | Python 异步框架，AI/ML 生态对接最方便 |
| 实时服务 | Go + Gorilla | 1.22+ | 高并发 WebSocket 性能最优，内存占用低 |
| 主数据库 | PostgreSQL | 16+ | 功能最全面的开源关系型数据库 |
| ORM | Prisma | 5+ | 类型安全、迁移管理方便、DX 极佳 |
| 缓存 | Redis | 7+ | 高性能 KV 存储，支持丰富数据结构 |
| 搜索引擎 | Elasticsearch | 8+ | 全文检索行业标准，中文分词支持好 |
| 消息队列 | RabbitMQ | 3.12+ | 成熟稳定，支持多种 exchange 模式 |
| 对象存储 | MinIO | latest | S3 兼容，可私有部署，开发成本低 |
| 容器编排 | Docker Compose | v2 | 本地开发一键启动，环境一致性 |
| 包管理 | Turborepo + pnpm | latest | Monorepo 最佳实践，增量构建、并行任务 |

---

## 二、前端选型详解

### 2.1 React 18 + TypeScript

**选择理由：**
- 全球最大前端生态，三方库支持最全
- TypeScript 提供类型安全，降低大型项目维护成本
- React Server Components 为后续 SEO 优化预留空间
- 团队招聘最容易

**对比方案：**

| 方案 | 优势 | 劣势 | 结论 |
|---|---|---|---|
| React | 生态最大、社区最活跃 | 包体积相对大 | ✅ 选择 |
| Vue 3 | 上手简单、文档中文友好 | 企业级生态不如 React | ❌ |
| Svelte | 编译时框架、性能好 | 生态太小、组件库少 | ❌ |
| Angular | 大而全 | 太重、学习曲线陡 | ❌ |

### 2.2 Tailwind CSS

**选择理由：**
- 原子化 CSS，无需命名类名，减少样式冲突
- shadcn/ui 基于 Tailwind，天然集成
- 生产环境 tree-shaking 后包体积极小
- 响应式设计内置，写起来极快

### 2.3 shadcn/ui

**选择理由：**
- 不是 npm 包，而是直接复制源码到项目中，可完全定制
- 基于 Radix UI 原语，无障碍访问 (a11y) 支持好
- 设计审美在线，默认即可用
- 社区活跃，组件持续增加

---

## 三、后端选型详解

### 3.1 NestJS — 主框架

**选择理由：**
- 采用装饰器 + 依赖注入，代码结构清晰，适合大型项目
- 原生支持微服务模式（TCP / Redis / RabbitMQ / gRPC 传输）
- 内置模块系统，按领域拆分天然支持 DDD
- GraphQL + REST + WebSocket 统一支持
- TypeScript 全栈统一语言栈

**对比方案：**

| 方案 | 优势 | 劣势 | 结论 |
|---|---|---|---|
| NestJS | 企业级、模块化、微服务原生 | 上手门槛略高 | ✅ 选择 |
| Express | 极简、灵活 | 无架构约束，大项目容易混乱 | ❌ |
| Spring Boot | 生态最完善 | 重、启动慢、技术栈不统一 | ❌ |
| Go Gin | 高性能 | 开发效率不如 Node.js | ❌ |

### 3.2 FastAPI — AI 服务

**选择理由：**
- Python 是 AI/ML 的事实标准语言
- FastAPI 异步性能优秀，自动生成 OpenAPI 文档
- 轻松对接 OpenAI SDK、LangChain、向量数据库等
- 开发效率高，适合快速原型验证

### 3.3 Go — 实时服务

**选择理由：**
- goroutine 轻量级并发，单机可支撑百万级 WebSocket 连接
- 编译为单二进制，部署简单
- 内存占用极低（相比 Node.js）
- 社区成熟的 WebSocket 库（gorilla/websocket）

**对比方案：**

| 方案 | 优势 | 劣势 | 结论 |
|---|---|---|---|
| Go | 高并发、低内存 | WebSocket 业务逻辑不如 Node 灵活 | ✅ 选择 |
| Node.js (Socket.IO) | 开发效率高 | 单机并发上限低 | ❌ |
| Elixir (Phoenix) | 天生高并发 | 团队学习成本极高 | ❌ |

---

## 四、数据层选型详解

### 4.1 PostgreSQL vs MySQL vs MongoDB

| 维度 | PostgreSQL | MySQL | MongoDB |
|---|---|---|---|
| JSON 支持 | JSONB 原生高效 | JSON 类型较弱 | BSON 原生 |
| 全文检索 | 内置 tsvector | 内置但弱 | 内置 |
| 扩展性 | 插件生态丰富 | 较少 | - |
| ACID | 完整支持 | 取决于引擎 | 4.0+ 支持 |
| GIS | PostGIS 成熟 | 基础支持 | 基础支持 |
| 社区 | 极活跃 | 极活跃 | 活跃 |
| **选择** | ✅ | ❌ | ❌ |

**选择 PostgreSQL 理由：**
- JSONB 类型可灵活存储游戏数据（英雄数据、比赛统计）
- 全文检索可作 Elasticsearch 降级方案
- 丰富的索引类型（GIN、GiST、BRIN）
- Prisma 对 PostgreSQL 支持最完善

### 4.2 Redis

**用途：**
- 热点数据缓存（帖子详情、用户信息）
- Session 存储
- 排行榜（Sorted Set 实现积分排行、赛季排名）
- 限流计数器
- 发布/订阅（跨服务实时通知）

### 4.3 Elasticsearch

**用途：**
- 帖子全文搜索（中文分词用 IK Analyzer）
- 搜索建议 / 自动补全
- 热搜词统计
- 用户行为日志分析（后续）

### 4.4 RabbitMQ

**选择理由（对比 Kafka）：**

| 维度 | RabbitMQ | Kafka |
|---|---|---|
| 复杂度 | 低 | 高 |
| 消息优先级 | 支持 | 不支持 |
| 延迟 | 微秒级 | 毫秒级 |
| 消费模式 | Push（灵活路由） | Pull（批处理） |
| 适用场景 | 业务事件、任务分发 | 日志流、大数据管道 |
| **选择** | ✅ | ❌ |

**用途：**
- 服务间异步事件（用户注册 → 发送欢迎邮件 + 初始化数据）
- 内容审核队列（发帖 → 敏感词检测 → 审核通知）
- 数据同步（PostgreSQL 写入 → 同步到 Elasticsearch）

---

## 五、基础设施选型

### 5.1 MinIO — 对象存储

| 方案 | 优势 | 劣势 | 结论 |
|---|---|---|---|
| MinIO | S3 兼容、私有部署、高性能 | 需要自己维护 | ✅ 选择 |
| 阿里云 OSS | 免运维 | 收费、依赖云厂商 | ❌ |
| 本地文件系统 | 零成本 | 无法扩展 | ❌ |

### 5.2 Nginx — API 网关

Kong 功能更强但复杂度高，MVP 阶段 Nginx 足够：
- 反向代理 + 负载均衡
- SSL 终止
- 静态资源缓存
- 基础限流

后续可升级为 Kong / APISIX。

### 5.3 Turborepo — Monorepo 管理

| 方案 | 优势 | 劣势 | 结论 |
|---|---|---|---|
| Turborepo | 增量构建、远程缓存、并行任务 | Vercel 维护，商业风险低 | ✅ 选择 |
| Nx | 功能全面 | 配置复杂 | ❌ |
| Lerna | 历史悠久 | 已停止活跃开发 | ❌ |

---

## 六、未选用技术说明

| 技术 | 不选用理由 |
|---|---|
| GraphQL | MVP 阶段复杂度高，REST + Swagger 更直观，后期可按需引入 |
| gRPC | 服务间通信用 RabbitMQ 异步解耦更优，gRPC 用在需要同步调用的场景（暂不需要） |
| Kubernetes | MVP 阶段过度设计，Docker Compose 足够，后期可迁移 |
| Next.js | 需要 SSR 但 MVP 阶段 SPA 更快出活，且微服务架构下 Next.js 不适合做 BFF 层 |
| MongoDB | 业务数据关系性强，PostgreSQL 更合适 |

---

## 七、技术风险与缓解

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| NestJS 学习曲线 | 开发初期效率低 | 编写团队内部最佳实践文档 |
| Go 实时服务稳定性 | WebSocket 断连/内存泄漏 | 充分压测 + pprof 性能分析 |
| 微服务调试复杂 | 本地开发体验差 | Docker Compose 一键启动 + 统一日志 |
| Elasticsearch 中文搜索 | 搜索结果不准 | 配置 IK 分词器 + 自定义词典（OW 术语） |
