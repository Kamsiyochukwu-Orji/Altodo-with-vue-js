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
import { useToast } from "vue-toastification";

const toast = useToast(); 

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
  try {
    if (editingTodo.value) {
      await updateTodoMutation.mutateAsync({
        id: editingTodo.value.id,
        payload,
      });
      toast.success("Todo updated successfully"); 
    } else {
      await createTodoMutation.mutateAsync(payload);
      toast.success("Todo created successfully"); 
    }

    isFormOpen.value = false;
    editingTodo.value = null;
  } catch (err: any) {
    toast.error(err?.message || "Something went wrong"); 
  }
}

async function handleDelete() {
  if (!deletingTodo.value) return;

  try {
    const deletedId = deletingTodo.value.id;

    await deleteTodoMutation.mutateAsync(deletedId);
    toast.success("Todo deleted successfully"); 

    deletingTodo.value = null;

    if (todoId.value === deletedId) {
      router.push(basePath.value);
    }
  } catch (err: any) {
    toast.error(err?.message || "Failed to delete todo"); 
  }
}
</script>