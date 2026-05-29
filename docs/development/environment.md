# 环境配置说明 — Pro-OW

> 版本: v1.0

---

## 一、前置依赖

| 工具 | 版本要求 | 安装方式 |
|---|---|---|
| Node.js | >= 20.x | [nvm-windows](https://github.com/coreybutler/nvm-windows) 或官网 |
| pnpm | >= 9.x | `npm install -g pnpm` |
| Docker | >= 24.x | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| Go | >= 1.22 | [go.dev](https://go.dev/dl/) (仅实时服务) |
| Python | >= 3.11 | [python.org](https://www.python.org/downloads/) (仅 AI 服务) |

---

## 二、开发环境搭建

### 2.1 克隆项目

```bash
git clone <repo-url>
cd Pro-OW
```

### 2.2 安装依赖

```bash
pnpm install
```

### 2.3 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
# 必填: DATABASE_URL, JWT_SECRET, REDIS_URL
```

### 2.4 .env 示例

```env
# === 数据库 ===
DATABASE_URL=postgresql://pro_ow:pro_ow_password@localhost:5432/pro_ow
DATABASE_URL_USER_SERVICE=postgresql://pro_ow:pro_ow_password@localhost:5432/pro_ow_user
DATABASE_URL_CONTENT_SERVICE=postgresql://pro_ow:pro_ow_password@localhost:5432/pro_ow_content

# === Redis ===
REDIS_URL=redis://localhost:6379

# === JWT ===
JWT_SECRET=your-secret-key-at-least-32-chars
JWT_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800

# === Elasticsearch ===
ELASTICSEARCH_URL=http://localhost:9200

# === RabbitMQ ===
RABBITMQ_URL=amqp://admin:admin@localhost:5672

# === MinIO ===
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=pro-ow-media

# === OpenAI (AI 服务) ===
OPENAI_API_KEY=sk-xxxxx

# === 服务端口 ===
USER_SERVICE_PORT=3001
CONTENT_SERVICE_PORT=3002
SOCIAL_SERVICE_PORT=3003
DATA_SERVICE_PORT=3004
AI_SERVICE_PORT=3005
REALTIME_SERVICE_PORT=8081
```

### 2.5 启动基础设施

```bash
docker-compose -f docker-compose.dev.yml up -d
```

会启动以下服务：
- PostgreSQL (端口 5432)
- Redis (端口 6379)
- Elasticsearch (端口 9200)
- RabbitMQ (端口 5672 + 管理界面 15672)
- MinIO (端口 9000 + 控制台 9001)

### 2.6 数据库初始化

```bash
# user-service
cd apps/services/user-service
npx prisma migrate dev
npx prisma db seed

# content-service
cd ../../services/content-service
npx prisma migrate dev
npx prisma db seed

# social-service
cd ../social-service
npx prisma migrate dev

# data-service
cd ../data-service
npx prisma migrate dev
```

### 2.7 启动所有服务

```bash
# 项目根目录
pnpm dev
```

### 2.8 验证

```bash
# 检查服务是否正常
curl http://localhost:3001/api/health    # user-service
curl http://localhost:3002/api/health    # content-service
curl http://localhost:3003/api/health    # social-service
curl http://localhost:3004/api/health    # data-service
```

---

## 三、Docker Compose 配置

`docker-compose.dev.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: pro_ow
      POSTGRES_PASSWORD: pro_ow_password
      POSTGRES_DB: pro_ow
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    ports:
      - "5672:5672"
      - "15672:15672"

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  pgdata:
  minio_data:
```

---

## 四、常用命令

```bash
# 开发
pnpm dev                    # 启动所有服务(含前端 HMR)
pnpm dev:web                # 仅启动前端
pnpm dev:user-service       # 仅启动用户服务

# 构建
pnpm build                  # 构建所有包
pnpm build:web              # 仅构建前端

# 数据库
pnpm db:migrate             # 执行所有服务的迁移
pnpm db:studio              # 打开 Prisma Studio
pnpm db:seed                # 填充种子数据

# 测试
pnpm test                   # 运行所有测试
pnpm test:unit              # 单元测试
pnpm test:e2e               # E2E 测试

# 代码质量
pnpm lint                   # ESLint 检查
pnpm format                 # Prettier 格式化
pnpm type-check             # TypeScript 类型检查
```

---

## 五、生产部署

详见 [docs/deployment/](./deployment/) 目录(后续补充)