import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
import type { MaybeRef } from "vue";
import { unref } from "vue";
import type { ListTodosParams, Todo, TodoFormPayload, TodoListResponse, TodoMeta } from "../types";
import { apiClient } from "./client";

const TASKS_QUERY_KEY = ["tasks"] as const;

const DEFAULT_META: TodoMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const normalizeTask = (task: Record<string, unknown>): Todo => {
  const status = String(task.status ?? "TODO") as Todo["status"];
  const priority = String(task.priority ?? "LOW") as Todo["priority"];

  return {
    id: String(task.id ?? ""),
    title: String(task.name ?? "Untitled task"),
    description: String(task.description ?? ""),
    status,
    priority,
    completed: status === "DONE",
    archived: Boolean(task.archived ?? false),
    start: (task.start as string) ?? null,
    end: (task.end as string) ?? null,
    duration: (task.duration as number) ?? null,
    isDefault: (task.isDefault as boolean) ?? null,
    parentId: (task.parentId as string) ?? null,
    children: (task.children as string) ?? null,
    owner: (task.owner as string) ?? null,
    tags: (task.tags as string) ?? null,
    completedAt: (task.completedAt as string) ?? null,
    createdAt: (task.createdAt as string) ?? null,
    updatedAt: (task.updatedAt as string) ?? null,
  };
};

const normalizeListResponse = (responseData: Record<string, unknown>): TodoListResponse => ({
  data: Array.isArray(responseData?.data)
    ? (responseData.data as Record<string, unknown>[]).map(normalizeTask)
    : [],
  meta: responseData?.meta
    ? { ...DEFAULT_META, ...(responseData.meta as Partial<TodoMeta>) }
    : DEFAULT_META,
});

const emptyToNull = (value: unknown): unknown => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && !value.trim()) return null;
  return value;
};

const normalizeNumberField = (value: unknown): number | null => {
  const normalized = emptyToNull(value);
  if (normalized === null) return null;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

const toTaskPayload = (payload: TodoFormPayload) => ({
  name: payload.title?.trim() ?? "",
  description: emptyToNull(payload.description?.trim()),
  status: payload.status ?? "TODO",
  priority: payload.priority ?? "LOW",
  archived: payload.archived ?? false,
  start: null,
  end: null,
  duration: normalizeNumberField(payload.duration),
  isDefault: payload.isDefault === null ? null : payload.isDefault ?? null,
  parentId: emptyToNull(payload.parentId),
  children: payload.children?.trim() ?? "",
  owner: emptyToNull(payload.owner),
  tags: emptyToNull(payload.tags),
  completedAt: null,
});

export const listTodos = async (params: ListTodosParams = {}): Promise<TodoListResponse> => {
  const { page = 1, limit = 10, search = "", status = "all", sort = "DESC", all } = params;
  const queryParams: Record<string, unknown> = { page, limit, sort };

  if (typeof all === "boolean") queryParams.all = all;
  if (search.trim()) queryParams.search = search.trim();
  if (status !== "all") queryParams.status = status;

  const { data } = await apiClient.get("/tasks", { params: queryParams });
  return normalizeListResponse(data);
};

export const getTodoById = async (id: string): Promise<Todo> => {
  const { data } = await apiClient.get(`/tasks/${id}`);
  return normalizeTask(data);
};

export const createTodo = async (payload: TodoFormPayload): Promise<Todo> => {
  const { data } = await apiClient.post("/tasks", toTaskPayload(payload));
  return normalizeTask(data);
};

export const updateTodo = async ({ id, payload }: { id: string; payload: TodoFormPayload }): Promise<Todo> => {
  const { data } = await apiClient.patch(`/tasks/${id}`, toTaskPayload(payload));
  return normalizeTask(data);
};

export const deleteTodo = async (id: string): Promise<string> => {
  await apiClient.delete(`/tasks/${id}`);
  return id;
};

export const useTodosQuery = (params: MaybeRef<ListTodosParams>) =>
  useQuery({
    queryKey: computed(() => [...TASKS_QUERY_KEY, unref(params)]),
    queryFn: () => listTodos(unref(params)),
  });

export const useTodoDetailsQuery = (todoId: MaybeRef<string | undefined>) =>
  useQuery({
    queryKey: computed(() => [...TASKS_QUERY_KEY, unref(todoId)]),
    queryFn: () => getTodoById(unref(todoId)!),
    enabled: computed(() => Boolean(unref(todoId))),
  });

export const useCreateTodoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

export const useUpdateTodoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TASKS_QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteTodoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.removeQueries({ queryKey: [...TASKS_QUERY_KEY, id] });
    },
  });
};
