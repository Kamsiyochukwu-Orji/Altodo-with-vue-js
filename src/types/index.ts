export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  completed: boolean;
  archived: boolean;
  start: string | null;
  end: string | null;
  duration: number | null;
  isDefault: boolean | null;
  parentId: string | null;
  children: string | null;
  owner: string | null;
  tags: string | null;
  completedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TodoMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TodoListResponse {
  data: Todo[];
  meta: TodoMeta;
}

export interface ListTodosParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: "ASC" | "DESC";
  all?: boolean;
}

export interface TodoFormPayload {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  archived: boolean;
  start: string;
  end: string;
  duration: string | number;
  isDefault: boolean | null;
  parentId: string;
  children: string;
  owner: string;
  tags: string;
  completedAt: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}
