# Git 提交规范 — Pro-OW

> 版本: v1.0 | 基于 Conventional Commits | 语言: 中文

---

## 一、提交格式

```
<type>(<scope>): <中文简述>

<详细说明>
```

**示例：**
```
feat(content): 实现帖子 CRUD 接口与 ES 搜索同步

- 新增帖子的创建/查看/编辑/删除接口
- 发布 PostCreated 事件到 RabbitMQ
- 异步同步帖子索引到 Elasticsearch

Closes #42
```

---

## 二、Type 类型

| Type | 说明 | 示例 |
|---|---|---|
| `feat` | 新功能 | `feat(user): 添加邮箱验证功能` |
| `fix` | Bug 修复 | `fix(auth): 修复 Token 过期判断错误` |
| `refactor` | 重构(非功能/非修复) | `refactor(content): 抽取搜索逻辑为独立模块` |
| `perf` | 性能优化 | `perf(search): 添加 ES 缓存层` |
| `style` | 代码格式(不影响逻辑) | `style: 统一 Prettier 格式化` |
| `docs` | 文档更新 | `docs(api): 补充通知接口文档` |
| `test` | 测试相关 | `test(auth): 添加登录流程 E2E 测试` |
| `chore` | 构建/工具/依赖 | `chore(deps): 升级 Prisma 到 5.x` |
| `ci` | CI/CD 配置 | `ci: 添加 GitHub Actions 工作流` |
| `revert` | 回滚 | `revert: 回滚帖子草稿功能` |

---

## 三、Scope 范围

| Scope | 说明 |
|---|---|
| `user` | 用户服务 |
| `content` | 内容服务 |
| `social` | 社交服务 |
| `data` | 数据服务 |
| `ai` | AI 服务 |
| `realtime` | 实时服务 |
| `web` | Web 前端 |
| `admin` | 管理后台 |
| `gateway` | API 网关 |
| `infra` | 基础设施(Docker/配置) |
| `db` | 数据库迁移 |
| `shared` | 共享包 |
| `deps` | 依赖 |

---

## 四、分支规范

| 分支 | 用途 | 命名 |
|---|---|---|
| `main` | 生产分支(只接受 PR/MR) | `main` |
| `develop` | 开发分支 | `develop` |
| `feature/*` | 功能分支 | `feature/user-oauth` |
| `fix/*` | Bug 修复 | `fix/login-redirect` |
| `hotfix/*` | 紧急修复(从 main 分出) | `hotfix/xss-patch` |
| `release/*` | 发布分支 | `release/v0.1.0` |

### 分支工作流

```mermaid
gitGraph
    commit id: "初始化"
    branch develop
    checkout develop
    commit id: "基础配置"
    
    branch feature/user-auth
    checkout feature/user-auth
    commit id: "feat: 用户注册"
    commit id: "feat: 用户登录"
    
    checkout develop
    merge feature/user-auth
    
    branch feature/post-crud
    checkout feature/post-crud
    commit id: "feat: 帖子接口"
    
    checkout develop
    branch release/v0.1
    commit id: "版本号升级"
    
    checkout main
    merge release/v0.1 tag: "v0.1.0"
    
    checkout develop
    merge release/v0.1
    merge feature/post-crud
```

---

## 五、Commit Message 规则

1. **type 和 scope 使用英文**（保持与 Conventional Commits 兼容）
2. **简述使用中文**，简洁明了
3. **Header 不超过 72 字符**
4. **Body 每行不超过 72 字符**
5. **与 Issue 关联**：`Closes #123` 或 `Refs #456`

### 好 vs 坏

```
# ✅ 好
feat(content): 添加 Elasticsearch 全文搜索
fix(auth): 修复并发刷新 Token 的竞态问题

# ❌ 坏
update code
fix bug
WIP
asdf
.
```

---

## 六、版本号规范 (SemVer)

```
MAJOR.MINOR.PATCH

- MAJOR: 不兼容的 API 变更
- MINOR: 向下兼容的新功能
- PATCH: 向下兼容的 Bug 修复

示例:
v0.1.0  → v0.1.1  (修复了小 bug)
v0.1.0  → v0.2.0  (新增了组队功能)
v0.2.0  → v1.0.0  (正式发布)
```

---

## 七、PR/MR 规范

### PR 标题
```
feat(content): 实现帖子 CRUD 接口
```

### PR 描述模板

```markdown
## 变更说明
简要描述做了什么变更

## 变更类型
- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 重构 (refactor)
- [ ] 文档 (docs)
- [ ] 其他

## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过

## 截图(UI 变更时)
<截图>

## 关联 Issue
Closes #42
```

### Code Review 检查清单

- [ ] 代码符合规范(命名、结构)
- [ ] 有适当的错误处理
- [ ] 没有硬编码的敏感信息
- [ ] TypeScript 类型安全(无 any)
- [ ] 新功能有测试
- [ ] 数据库迁移已添加
- [ ] API 文档已更新

---

## 八、Git Hooks (推荐配置)

```json
// .husky/commit-msg
{
  "hooks": {
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
    "pre-commit": "lint-staged"
  }
}
```

```json
// lint-staged 配置
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yaml}": ["prettier --write"],
  "*.prisma": ["prisma format"]
}
```