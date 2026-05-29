// API 通用响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// 用户角色
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

// 帖子状态
export enum PostStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
}