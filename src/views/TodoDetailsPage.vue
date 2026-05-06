<script setup lang="ts">
import { computed, inject } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useTodoDetailsQuery } from "../api/todos";
import type { Todo } from "../types";
import Seo from "../shared/Seo.vue";

const route = useRoute();
const todoId = computed(() => route.params.todoId as string);
const listBasePath = computed(() =>
  route.path.startsWith("/my-tasks") ? "/my-tasks" : "/todos"
);

const onEdit = inject<(todo: Todo) => void>("onEditTodo", () => {});

const { data: todo, isLoading, isError, error } = useTodoDetailsQuery(todoId);

const formatStatusLabel = (status: string) => status.replace("_", " ");
const formatFieldValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "Unavailable";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
};
</script>

<template>
  <p v-if="isLoading" aria-live="polite">Loading details...</p>

  <section v-else-if="isError" role="alert">
    <h2>Could not load todo details</h2>
    <p>{{ (error as Error)?.message ?? "Unknown API error." }}</p>
    <RouterLink class="button button--secondary" :to="listBasePath">Back to list</RouterLink>
  </section>

  <article v-else-if="todo">
    <Seo :title="todo.title" :description="todo.description || 'Detailed view of the selected todo item.'" />
    <header class="details-header">
      <h2>{{ todo.title }}</h2>
      <button type="button" class="button button--secondary" @click="onEdit(todo)">Edit todo</button>
    </header>
    <p><strong>ID:</strong> {{ formatFieldValue(todo.id) }}</p>
    <p><strong>Status:</strong> {{ formatStatusLabel(todo.status) }}</p>
    <p><strong>Priority:</strong> {{ todo.priority }}</p>
    <p><strong>Description:</strong> {{ todo.description || "No description provided." }}</p>
    <p><strong>Archived:</strong> {{ todo.archived ? "true" : "false" }}</p>
    <p><strong>Start:</strong> {{ formatFieldValue(todo.start) }}</p>
    <p><strong>End:</strong> {{ formatFieldValue(todo.end) }}</p>
    <p><strong>Duration:</strong> {{ formatFieldValue(todo.duration) }}</p>
    <p><strong>Is Default:</strong> {{ formatFieldValue(todo.isDefault) }}</p>
    <p><strong>Parent ID:</strong> {{ formatFieldValue(todo.parentId) }}</p>
    <p><strong>Children:</strong> {{ formatFieldValue(todo.children) }}</p>
    <p><strong>Owner:</strong> {{ formatFieldValue(todo.owner) }}</p>
    <p><strong>Tags:</strong> {{ formatFieldValue(todo.tags) }}</p>
    <p><strong>Completed At:</strong> {{ formatFieldValue(todo.completedAt) }}</p>
    <p><strong>Created:</strong> {{ formatFieldValue(todo.createdAt) }}</p>
    <p><strong>Last Updated:</strong> {{ formatFieldValue(todo.updatedAt) }}</p>
    <RouterLink class="button button--secondary" :to="listBasePath">Back to list</RouterLink>
  </article>
</template>
