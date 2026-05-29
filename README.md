# Pro-OW — 守望先锋社区论坛

> 一个深度结合守望先锋游戏的企业级微服务社区平台

## 项目简介

Pro-OW 是一个面向守望先锋玩家的新一代社区论坛，不仅提供传统论坛的讨论功能，更深度集成游戏数据、AI 复盘、实时交互等创新玩法，打造沉浸式的玩家社区体验。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 后端框架 | NestJS (Node.js) |
| AI 服务 | Python + FastAPI |
| 实时服务 | Go + Gorilla WebSocket |
| 数据库 | PostgreSQL |
| 缓存 | Redis |
| 搜索引擎 | Elasticsearch |
| 消息队列 | RabbitMQ |
| 对象存储 | MinIO |
| 容器化 | Docker + Docker Compose |
| 包管理 | pnpm + Turborepo (Monorepo) |
| 网关 | Nginx |

## 环境要求

- **Node.js** >= 20.x
- **pnpm** >= 9.x
- **Docker** >= 24.x + Docker Compose v2
- **Go** >= 1.22（实时服务开发）
- **Python** >= 3.11（AI 服务开发）

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/mikasazwj/Pro-OW.git
cd Pro-OW
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动基础设施（数据库、缓存、消息队列等）

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 4. 初始化数据库

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. 启动所有服务

```bash
pnpm dev
```

### 6. 访问

| 服务 | 地址 |
|---|---|
| Web 前端 | http://localhost:3000 |
| 管理后台 | http://localhost:3001 |
| API Gateway | http://localhost:8080 |
| Swagger 文档 | http://localhost:8080/api/docs |
| MinIO 控制台 | http://localhost:9001 |
| RabbitMQ 管理 | http://localhost:15672 |

## 项目结构

```
Pro-OW/
├── apps/                     # 应用层
│   ├── web/                  # Web 前端 (React + Vite)
│   ├── admin/                # 管理后台
│   ├── api-gateway/          # API 网关 (Nginx 配置)
│   └── services/             # 后端微服务
│       ├── user-service/     # 用户服务 (NestJS)
│       ├── content-service/  # 内容服务 (NestJS)
│       ├── social-service/   # 社交服务 (NestJS)
│       ├── data-service/     # 数据服务 (NestJS)
│       ├── realtime-service/ # 实时服务 (Go)
│       └── ai-service/       # AI 服务 (Python FastAPI)
├── packages/                 # 共享包
│   ├── shared/               # 共享类型、工具函数
│   ├── ui/                   # UI 组件库
│   └── config/               # ESLint / TypeScript 配置
├── docker/                   # Docker 相关配置
├── docs/                     # 项目文档
├── docker-compose.dev.yml    # 开发环境 Docker Compose
├── docker-compose.prod.yml   # 生产环境 Docker Compose
├── turbo.json                # Turborepo 配置
└── pnpm-workspace.yaml       # pnpm workspace 配置
```

## 开发指南

详见 [docs/development/](./docs/development/) 目录：

- [代码规范](./docs/development/coding-standards.md)
- [Git 提交规范](./docs/development/git-conventions.md)
- [环境配置说明](./docs/development/environment.md)

## 文档导航

- [产品需求文档 (PRD)](./docs/prd/requirements.md)
- [技术选型说明](./docs/architecture/tech-selection.md)
- [系统架构设计](./docs/architecture/system-architecture.md)
- [数据库设计](./docs/database/schema.md)
- [API 文档](./docs/api/README.md)
- [项目规划](./docs/prd/project-plan.md)

## License

MIT