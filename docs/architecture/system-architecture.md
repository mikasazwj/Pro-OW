# 系统架构设计文档 — Pro-OW

> 版本: v1.0 | 日期: 2026-05-29 | 框架: C4 模型

---

## 一、C4 Level 1 — 系统上下文图 (System Context)

```mermaid
C4Context
    title 系统上下文图 — Pro-OW 论坛平台

    Person(user, "论坛用户", "守望先锋玩家，浏览帖子、发帖、互动")
    Person(admin, "管理员", "管理内容、审核、配置系统")
    Person(moderator, "版主", "分区管理、帖子审核")
    
    System(pro_ow, "Pro-OW 平台", "守望先锋主题社区论坛")
    
    System_Ext(blizzard, "战网 API", "暴雪官方 API")
    System_Ext(openai_api, "OpenAI API", "AI 复盘分析")
    System_Ext(email_svc, "邮件服务", "通知邮件发送")
    System_Ext(cdn, "CDN", "静态资源/图片分发")
    
    Rel(user, pro_ow, "浏览、发帖、组队、竞猜", "HTTPS")
    Rel(admin, pro_ow, "管理配置、审核", "HTTPS")
    Rel(moderator, pro_ow, "帖子审核、分区管理", "HTTPS")
    Rel(pro_ow, blizzard, "获取玩家数据", "HTTPS/OAuth")
    Rel(pro_ow, openai_api, "AI 复盘分析", "HTTPS")
    Rel(pro_ow, email_svc, "发送邮件", "SMTP")
    Rel(pro_ow, cdn, "分发静态资源", "HTTPS")
```

---

## 二、C4 Level 2 — 容器图 (Container Diagram)

```mermaid
C4Container
    title 容器图 — Pro-OW 微服务架构

    Person(user, "用户", "浏览器/客户端")
    Person(admin_user, "管理员", "管理后台")
    
    Container_Boundary(frontend, "前端") {
        Container(web_app, "Web 前端", "React + Vite + TypeScript", "用户端 SPA 应用")
        Container(admin_app, "管理后台", "React + TypeScript", "管理员控制台")
    }
    
    Container_Boundary(gateway, "网关层") {
        Container(nginx, "Nginx 网关", "反向代理、限流、SSL", "API 统一入口")
    }
    
    Container_Boundary(services, "微服务层") {
        Container(user_svc, "用户服务", "NestJS", "注册/登录/个人主页/权限")
        Container(content_svc, "内容服务", "NestJS", "帖子/评论/板块管理")
        Container(social_svc, "社交服务", "NestJS", "点赞/收藏/关注/通知")
        Container(data_svc, "数据服务", "NestJS", "积分/等级/排行榜/赛季")
        Container(ai_svc, "AI 服务", "Python FastAPI", "AI 复盘分析/内容审核")
        Container(realtime_svc, "实时服务", "Go Gorilla", "WebSocket 连接管理")
    }
    
    Container_Boundary(data_layer, "数据层") {
        ContainerDb(pg, "PostgreSQL", "关系型数据库", "核心业务数据")
        ContainerDb(redis, "Redis", "缓存", "Session/热点/排行榜")
        ContainerDb(es, "Elasticsearch", "搜索引擎", "全文检索/搜索建议")
        ContainerDb(minio, "MinIO", "对象存储", "图片/视频/文件")
        ContainerQueue(rabbitmq, "RabbitMQ", "消息队列", "异步事件/服务解耦")
    }
    
    Rel(user, web_app, "HTTPS", "浏览/发帖/互动")
    Rel(admin_user, admin_app, "HTTPS", "管理操作")
    
    Rel(web_app, nginx, "HTTPS", "API 请求")
    Rel(admin_app, nginx, "HTTPS", "API 请求")
    Rel(realtime_svc, web_app, "WSS", "实时推送")
    
    Rel(nginx, user_svc, "HTTP", "用户相关")
    Rel(nginx, content_svc, "HTTP", "内容相关")
    Rel(nginx, social_svc, "HTTP", "社交相关")
    Rel(nginx, data_svc, "HTTP", "数据相关")
    Rel(nginx, ai_svc, "HTTP", "AI 相关")
    
    Rel(user_svc, pg, "SQL", "读写")
    Rel(content_svc, pg, "SQL", "读写")
    Rel(social_svc, pg, "SQL", "读写")
    Rel(data_svc, pg, "SQL", "读写")
    
    Rel(user_svc, redis, "读写", "缓存/会话")
    Rel(content_svc, redis, "读写", "热点内容缓存")
    Rel(data_svc, redis, "读写", "排行榜")
    Rel(realtime_svc, redis, "读写", "在线状态")
    
    Rel(content_svc, es, "写入", "同步搜索索引")
    Rel(user_svc, rabbitmq, "发布", "用户事件")
    Rel(content_svc, rabbitmq, "发布/订阅", "内容事件")
    Rel(social_svc, rabbitmq, "发布/订阅", "社交事件")
    Rel(ai_svc, rabbitmq, "订阅", "异步处理任务")
    Rel(content_svc, minio, "读写", "文件存储")
    Rel(ai_svc, minio, "读", "读取录像文件")
```

---

## 三、模块职责划分

| 服务 | 核心职责 | 依赖 |
|---|---|---|
| user-service | 注册/登录/鉴权、个人主页、用户信息管理、权限管理 | PostgreSQL, Redis, RabbitMQ |
| content-service | 帖子 CRUD、评论 CRUD、板块管理、搜索、审核 | PostgreSQL, Elasticsearch, MinIO, RabbitMQ |
| social-service | 点赞/取消赞、收藏/取消收藏、关注/取消关注、通知 | PostgreSQL, Redis, RabbitMQ |
| data-service | 积分计算、等级管理、排行榜、赛季管理、数据统计 | PostgreSQL, Redis, RabbitMQ |
| ai-service | AI 复盘分析、内容审核辅助、智能推荐 | OpenAI API, MinIO, RabbitMQ |
| realtime-service | WebSocket 连接管理、实时消息推送、在线状态 | Redis |

---

## 四、关键技术决策

### 4.1 事件驱动通信

服务间通过 RabbitMQ 异步通信，采用**发布/订阅**模式：

```mermaid
graph LR
    A["用户服务 UserCreated 事件"] --> B["RabbitMQ user.events exchange"]
    B --> C["数据服务 初始化用户积分"]
    B --> D["内容服务 创建用户文件夹"]
    B --> E["社交服务 发送欢迎通知"]
```

**事件类型定义：**

| Exchange | 事件 | 发布者 | 订阅者 |
|---|---|---|---|
| user.events | UserCreated | user-service | data-service, social-service |
| user.events | UserBanned | user-service | content-service |
| content.events | PostCreated | content-service | data-service, es-sync |
| content.events | PostDeleted | content-service | data-service, es-sync |
| content.events | CommentCreated | content-service | social-service, data-service |
| social.events | PostLiked | social-service | data-service |
| social.events | UserFollowed | social-service | realtime-service |
| ai.events | ReplayAnalysisCompleted | ai-service | content-service, social-service |

### 4.2 读写分离 (CQRS Lite)

- **写操作**：服务 → PostgreSQL
- **读操作**：Web → API Gateway → 查询 Elasticsearch 或 Redis 缓存
- **同步**：RabbitMQ 事件驱动，PostgreSQL 写入后异步同步到 ES

```mermaid
sequenceDiagram
    participant User as 用户
    participant GW as API Gateway
    participant Content as 内容服务
    participant PG as PostgreSQL
    participant MQ as RabbitMQ
    participant ES as Elasticsearch
    
    User->>GW: 发帖请求
    GW->>Content: POST /posts
    Content->>PG: INSERT post
    Content->>MQ: PostCreated 事件
    Content-->>User: 返回成功
    
    MQ->>Content: ES 同步消费者
    Content->>ES: INDEX 帖子到搜索索引
    
    User->>GW: 搜索帖子
    GW->>Content: GET /search?q=xxx
    Content->>ES: 全文搜索
    Content-->>User: 返回结果
```

### 4.3 缓存策略

| 数据类型 | 缓存策略 | 过期时间 |
|---|---|---|
| 帖子详情 | Cache-Aside (先查缓存，未命中查 DB) | 10 分钟 |
| 热门帖子列表 | Write-Through (写 DB 同时更新缓存) | 5 分钟 |
| 用户 Session | Redis 存储 | 7 天 |
| 排行榜 (Sorted Set) | 定时任务更新 | 实时 |
| 限流计数器 | Redis INCR + TTL | 按窗口 |

### 4.4 鉴权方案

```mermaid
sequenceDiagram
    participant User as 用户
    participant GW as API Gateway
    participant Auth as 用户服务
    participant Svc as 其他服务
    
    User->>Auth: POST /auth/login
    Auth->>Auth: 验证用户名密码
    Auth-->>User: AccessToken + RefreshToken
    
    Note over User,Svc: 后续请求
    
    User->>GW: 请求 + Authorization Header
    GW->>Auth: 验证 Token
    Auth-->>GW: 用户信息 + 权限
    GW->>Svc: 转发 (附加 X-User-Id Header)
    Svc-->>User: 响应
```

- **AccessToken**：JWT，15 分钟过期
- **RefreshToken**：随机字符串，7 天过期，存储在 Redis
- **网关鉴权**：Nginx 层不做鉴权，转发到 user-service 统一鉴权

---

## 五、部署架构

```mermaid
graph TB
    subgraph External["DNS / CDN"]
        DNS[DNS 解析]
        CDN["CDN 静态资源"]
    end
    
    subgraph LB["负载均衡"]
        SLB["负载均衡 SLB"]
    end
    
    subgraph Web["Web 服务器"]
        W1["Web 前端 1"]
        W2["Web 前端 2"]
    end
    
    subgraph GW["API 网关"]
        G1["Nginx 1"]
        G2["Nginx 2"]
    end
    
    subgraph Svc["微服务集群"]
        S1["user-service"] 
        S2["content-service"]
        S3["social-service"]
        S4["data-service"]
        S5["ai-service"]
        S6["realtime-service"]  
    end
    
    subgraph Data["数据集群"]
        PG_M["PostgreSQL 主"]
        PG_S["PostgreSQL 从"]
        RDS["Redis 集群"]
        ES["Elasticsearch"] 
        MQ["RabbitMQ"] 
        MIN["MinIO"] 
    end
    
    DNS --> CDN
    DNS --> SLB
    SLB --> W1
    SLB --> W2
    W1 --> G1
    W2 --> G2
    G1 --> S1
    G1 --> S2
    G2 --> S3
    G2 --> S4
    S1 --> PG_M
    S2 --> PG_M
    S3 --> PG_M
    S4 --> PG_M
    S5 --> PG_M
    PG_M --> PG_S
    S1 --> RDS
    S2 --> RDS
    S2 --> ES
    S4 --> RDS
    S6 --> RDS
    S2 --> MQ
    S5 --> MQ
    S2 --> MIN
    S5 --> MIN
```