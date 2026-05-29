# 代码规范 — Pro-OW

> 版本: v1.0 | 日期: 2026-05-29

---

## 一、通用原则

- **可读性优先**：代码是写给人看的，顺便给机器执行
- **一致性**：保持与现有代码风格一致
- **简洁**：避免过度设计，YAGNI (You Aren't Gonna Need It)
- **类型安全**：TypeScript strict mode，禁止 `any`（除非有合理理由并注释说明）

---

## 二、命名规范

### 2.1 通用规则

| 类型 | 规范 | 示例 |
|---|---|---|
| 文件 | kebab-case | `user-profile.service.ts` |
| 目录 | kebab-case | `user-service/src/modules/` |
| 变量/函数 | camelCase | `getUserById`, `postCount` |
| 类/接口/类型 | PascalCase | `UserService`, `CreatePostDto` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| 私有属性/方法 | `_` 前缀(camelCase) | `_passwordHash`, `_validateEmail()` |
| 枚举 | PascalCase | `UserRole`, `PostStatus` |
| 数据库表/字段 | snake_case | `user_stats`, `created_at` |

### 2.2 NestJS 命名

| 类型 | 后缀 | 示例 |
|---|---|---|
| Module | `.module.ts` | `user.module.ts` |
| Controller | `.controller.ts` | `auth.controller.ts` |
| Service | `.service.ts` | `auth.service.ts` |
| Repository | `.repository.ts` | `user.repository.ts` |
| DTO | `.dto.ts` | `create-post.dto.ts` |
| Entity | `.entity.ts` | `user.entity.ts` |
| Guard | `.guard.ts` | `jwt-auth.guard.ts` |
| Interceptor | `.interceptor.ts` | `transform.interceptor.ts` |
| Pipe | `.pipe.ts` | `validation.pipe.ts` |
| Decorator | `.decorator.ts` | `roles.decorator.ts` |

### 2.3 React 命名

| 类型 | 后缀 | 示例 |
|---|---|---|
| 页面组件 | `page.tsx` | `/boards/page.tsx` |
| UI 组件 | PascalCase `.tsx` | `PostCard.tsx`, `CommentList.tsx` |
| 自定义 Hook | `use` 前缀 | `useAuth`, `usePosts` |
| Context | `Context` 后缀 | `AuthContext`, `ThemeContext` |
| 工具函数 | camelCase `.ts` | `formatDate.ts`, `api-client.ts` |

---

## 三、目录结构规范

### 3.1 NestJS 微服务

```
apps/services/user-service/
├── src/
│   ├── main.ts                    # 入口(bootstrap)
│   ├── app.module.ts              # 根模块
│   ├── common/                    # 公共模块
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/                    # 配置模块
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── jwt.config.ts
│   ├── modules/                   # 业务模块
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   └── dto/
│   │   └── ...
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── test/
├── Dockerfile
├── tsconfig.json
└── package.json
```

### 3.2 React 前端

```
apps/web/
├── src/
│   ├── main.tsx                   # 入口
│   ├── App.tsx                    # 根组件
│   ├── routes/                    # 路由配置
│   │   └── index.tsx
│   ├── pages/                     # 页面组件
│   │   ├── home/
│   │   │   ├── HomePage.tsx
│   │   │   └── components/
│   │   ├── post/
│   │   │   ├── PostDetailPage.tsx
│   │   │   ├── PostCreatePage.tsx
│   │   │   └── components/
│   │   └── user/
│   ├── components/                # 通用组件
│   │   └── ui/                    # shadcn/ui 组件
│   ├── hooks/                     # 自定义 Hooks
│   ├── lib/                       # 工具函数
│   │   ├── api-client.ts
│   │   └── format.ts
│   ├── contexts/                  # Context Providers
│   ├── types/                     # 类型定义
│   └── styles/                    # 全局样式
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 四、编码规范

### 4.1 TypeScript

```typescript
// ✅ 推荐：接口定义 DTO
export interface CreatePostDto {
  readonly boardId: string;
  readonly title: string;
  readonly content: string;
  readonly tagIds?: string[];
}

// ✅ 推荐：class-validator 校验
export class CreatePostDto {
  @IsUUID()
  boardId: string;

  @IsString()
  @Length(1, 200)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsOptional()
  @IsUUID('all', { each: true })
  tagIds?: string[];
}

// ❌ 避免 any
const data: any = response; // 不推荐

// ✅ 推荐
const data: ApiResponse<Post> = response;

// ✅ 推荐：使用 readonly 保护不可变数据
constructor(private readonly usersService: UsersService) {}
```

### 4.2 NestJS

```typescript
// ✅ 推荐：Controller 薄，Service 厚
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<ApiResponse<LoginResult>> {
    const result = await this.authService.login(dto);
    return { code: 0, message: 'ok', data: result };
  }
}

// ✅ 推荐：Service 中的业务逻辑
@Injectable()
export class AuthService {
  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }
    // ...
  }
}

// ✅ 推荐：统一异常处理
throw new BadRequestException('帖子标题不能为空');
throw new NotFoundException('帖子不存在');
throw new ForbiddenException('无权限执行此操作');
```

### 4.3 React

```tsx
// ✅ 推荐：函数组件 + Hooks
export function PostCard({ post, onLike }: PostCardProps) {
  const { user } = useAuth();
  
  const handleLike = useCallback(() => {
    if (!user) {
      toast.error('请先登录');
      return;
    }
    onLike(post.id);
  }, [user, post.id, onLike]);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>{post.summary}</CardContent>
      <CardFooter>
        <Button variant="ghost" onClick={handleLike}>
          <Heart className={post.isLiked ? 'fill-red-500' : ''} />
          {post.likeCount}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ❌ 避免：class 组件
// ❌ 避免：过大的组件(>300 行)
// ✅ 推荐：拆分小组件
```

### 4.4 异步处理

```typescript
// ✅ 推荐：async/await + try/catch
async function fetchPosts(boardId: string): Promise<Post[]> {
  try {
    const response = await api.get<ApiResponse<Post[]>>('/posts', { params: { boardId } });
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new AppError(error.response?.data?.message ?? '网络错误');
    }
    throw error;
  }
}

// ✅ 推荐：Promise.all 并行请求
const [posts, boards] = await Promise.all([
  fetchPosts(),
  fetchBoards(),
]);

// ❌ 避免：回调地狱
// ❌ 避免：空的 catch 块
```

---

## 五、注释规范

```typescript
/**
 * 获取帖子的分页评论列表
 * @param postId - 帖子 ID
 * @param page - 页码(从 1 开始)
 * @param pageSize - 每页数量
 * @returns 分页评论数据
 */
async getComments(postId: string, page: number, pageSize: number): Promise<PaginatedResult<Comment>> {
  // ...
}

// TODO: 后续需要添加缓存层 (@username, 2026-06-15)
// FIXME: 大帖子列表有性能问题，需要加虚拟滚动
// HACK: 临时方案，等 ES 上线后替换
// NOTE: 这里故意不用 JOIN，因为 PG 在 10 万数据量下 JOIN 很慢
```

**原则：**
- 好的代码不需要过多注释，命名即是文档
- 注释解释 **为什么** (Why) 而不是 **做了什么** (What)
- 复杂业务逻辑必须注释
- TODO/FIXME 必须附带负责人和日期