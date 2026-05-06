<script setup lang="ts">
import { computed, provide, ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useTodosQuery,
  useUpdateTodoMutation,
} from "../api/todos";
import { useAuthStore } from "../stores/auth";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import Pagination from "../components/Pagination.vue";
import TodoFormModal from "../components/TodoFormModal.vue";
import { useDebouncedValue } from "../composables/useDebouncedValue";
import Seo from "../shared/Seo.vue";
import type { Todo, TodoFormPayload } from "../types";

const PAGE_SIZE = 10;
const STATUS_FILTERS = ["all", "TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
const formatStatusLabel = (status: string) => status.replace("_", " ");

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isMyTasksView = computed(() => route.path.startsWith("/my-tasks"));
const basePath = computed(() => (isMyTasksView.value ? "/my-tasks" : "/todos"));
const todoId = computed(() => route.params.todoId as string | undefined);
const canManageTasks = computed(() => authStore.isAuthenticated);

const createTodoMutation = useCreateTodoMutation();
const updateTodoMutation = useUpdateTodoMutation();
const deleteTodoMutation = useDeleteTodoMutation();

const searchTerm = ref("");
const statusFilter = ref("all");
const page = ref(1);
const debouncedSearchTerm = useDebouncedValue(searchTerm, 450);

const queryParams = computed(() => ({
  page: page.value,
  limit: PAGE_SIZE,
  search: debouncedSearchTerm.value,
  status: statusFilter.value,
  sort: "DESC" as const,
}));

const { data: tasksResponse, isLoading, isError, error } = useTodosQuery(queryParams);
const tasks = computed(() => tasksResponse.value?.data ?? []);
const meta = computed(() => tasksResponse.value?.meta);

const isFormOpen = ref(false);
const editingTodo = ref<Todo | null>(null);
const deletingTodo = ref<Todo | null>(null);

function handleOpenCreate() {
  editingTodo.value = null;
  isFormOpen.value = true;
}

function handleOpenEdit(todo: Todo) {
  editingTodo.value = todo;
  isFormOpen.value = true;
}

provide("onEditTodo", handleOpenEdit);

async function handleCreateOrEdit(payload: TodoFormPayload) {
  if (editingTodo.value) {
    await updateTodoMutation.mutateAsync({ id: editingTodo.value.id, payload });
  } else {
    await createTodoMutation.mutateAsync(payload);
  }
  isFormOpen.value = false;
  editingTodo.value = null;
}

async function handleDelete() {
  if (!deletingTodo.value) return;

  const deletedId = deletingTodo.value.id;
  await deleteTodoMutation.mutateAsync(deletedId);
  deletingTodo.value = null;

  if (todoId.value === deletedId) {
    router.push(basePath.value);
  }
}
</script>

<template>
  <section v-if="isLoading" class="state-card" aria-live="polite">
    <Seo title="Loading todos" description="Loading your todo list." />
    <h1>Loading tasks...</h1>
  </section>

  <section v-else-if="isError" class="state-card" role="alert">
    <Seo title="Todo list error" description="There was an error loading the todo list." />
    <h1>Could not load tasks</h1>
    <p>{{ (error as Error)?.message ?? "Unknown API error." }}</p>
  </section>

  <section v-else class="todos-layout">
    <Seo
      :title="isMyTasksView ? 'My tasks' : 'All tasks'"
      description="View and manage tasks with pagination, searching, and status filters."
    />

    <section class="card">
      <header class="todos-header">
        <h1>{{ isMyTasksView ? "My Tasks" : "All Tasks" }}</h1>
        <div class="todo-item__actions">
          <RouterLink v-if="!isMyTasksView && authStore.isAuthenticated" to="/my-tasks" class="button button--secondary">
            View my tasks
          </RouterLink>
          <RouterLink v-if="isMyTasksView" to="/todos" class="button button--secondary">
            View all tasks
          </RouterLink>
          <button v-if="canManageTasks" type="button" class="button button--primary" @click="handleOpenCreate">
            Add todo
          </button>
        </div>
      </header>

      <form class="filters" role="search" aria-label="Todo filters">
        <div class="filters__field">
          <label for="search-todos">Search by title</label>
          <input
            id="search-todos"
            v-model="searchTerm"
            type="search"
            class="form__input"
            placeholder="Type a title..."
            @input="page = 1"
          />
        </div>
        <div class="filters__field">
          <label for="status-filter">Status</label>
          <select id="status-filter" v-model="statusFilter" class="form__input" @change="page = 1">
            <option v-for="status in STATUS_FILTERS" :key="status" :value="status">
              {{ status === "all" ? "All" : formatStatusLabel(status) }}
            </option>
          </select>
        </div>
      </form>

      <p class="filters__result-count" aria-live="polite">
        Showing {{ tasks.length }} of {{ meta?.total ?? 0 }} tasks
        {{ searchTerm !== debouncedSearchTerm ? " (updating search...)" : "" }}
      </p>

      <p v-if="tasks.length === 0">No tasks match your filters.</p>
      <ul v-else class="todo-list">
        <li
          v-for="todo in tasks"
          :key="todo.id"
          :class="['todo-item', { 'todo-item--selected': todoId === todo.id }]"
        >
          <article>
            <h2>
              <RouterLink :to="`${basePath}/${todo.id}`" class="todo-item__link">
                {{ todo.title }}
              </RouterLink>
            </h2>
            <p><strong>Status:</strong> {{ formatStatusLabel(todo.status) }}</p>
            <div v-if="canManageTasks" class="todo-item__actions">
              <button type="button" class="button button--secondary" @click="handleOpenEdit(todo)">Edit</button>
              <button type="button" class="button button--danger" @click="deletingTodo = todo">Delete</button>
            </div>
          </article>
        </li>
      </ul>

      <Pagination
        :current-page="meta?.page ?? page"
        :total-pages="meta?.totalPages ?? 1"
        @page-change="page = $event"
      />
    </section>

    <section class="card card--details">
      <RouterView v-if="todoId" />
      <article v-else>
        <h2>Todo details</h2>
        <p>Select a task from the list to view its full details.</p>
      </article>
    </section>

    <TodoFormModal
      :open="isFormOpen"
      :initial-todo="editingTodo"
      :is-submitting="createTodoMutation.isPending.value || updateTodoMutation.isPending.value"
      @close="() => { isFormOpen = false; editingTodo = null; }"
      @submit="handleCreateOrEdit"
    />

    <ConfirmDialog
      :open="Boolean(deletingTodo)"
      title="Delete this todo?"
      message="This action cannot be undone."
      confirm-text="Delete"
      :is-loading="deleteTodoMutation.isPending.value"
      @cancel="deletingTodo = null"
      @confirm="handleDelete"
    />
  </section>
</template>
