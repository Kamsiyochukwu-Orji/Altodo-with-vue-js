<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { Todo, TodoFormPayload } from "../types";

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"] as const;

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "TODO" as const,
  priority: "LOW" as const,
  archived: false,
  start: "",
  end: "",
  duration: "",
  isDefault: "",
  parentId: "",
  children: "",
  owner: "",
  tags: "",
  completedAt: "",
};

const props = defineProps<{
  open: boolean;
  initialTodo?: Todo | null;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [payload: TodoFormPayload];
}>();

const formValues = reactive({ ...EMPTY_FORM });
const error = ref("");

const toDateInputValue = (value: unknown): string => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

watch(
  () => [props.open, props.initialTodo] as const,
  ([open, initialTodo]) => {
    if (!open) return;

    if (initialTodo) {
      formValues.title = initialTodo.title;
      formValues.description = initialTodo.description;
      formValues.status = (initialTodo.status ?? "TODO") as typeof formValues.status;
      formValues.priority = (initialTodo.priority ?? "LOW") as typeof formValues.priority;
      formValues.archived = Boolean(initialTodo.archived);
      formValues.start = toDateInputValue(initialTodo.start);
      formValues.end = toDateInputValue(initialTodo.end);
      formValues.duration = initialTodo.duration != null ? String(initialTodo.duration) : "";
      formValues.isDefault = initialTodo.isDefault === null ? "" : String(initialTodo.isDefault);
      formValues.parentId = initialTodo.parentId ?? "";
      formValues.children = initialTodo.children ?? "";
      formValues.owner = initialTodo.owner ?? "";
      formValues.tags = initialTodo.tags ?? "";
      formValues.completedAt = toDateInputValue(initialTodo.completedAt);
    } else {
      Object.assign(formValues, EMPTY_FORM);
    }

    error.value = "";
  }
);

function handleSubmit() {
  if (!formValues.title.trim()) {
    error.value = "Title is required.";
    return;
  }

  error.value = "";
  emit("submit", {
    title: formValues.title.trim(),
    description: formValues.description.trim(),
    status: formValues.status,
    priority: formValues.priority,
    archived: formValues.archived,
    start: formValues.start,
    end: formValues.end,
    duration: formValues.duration,
    isDefault: formValues.isDefault === "" ? null : formValues.isDefault === "true",
    parentId: formValues.parentId,
    children: formValues.children,
    owner: formValues.owner,
    tags: formValues.tags,
    completedAt: formValues.completedAt,
  });
}
</script>

<template>
  <div v-if="open" class="dialog-backdrop" role="presentation" @click="emit('close')">
    <section
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="todo-dialog-heading"
      @click.stop
    >
      <h2 id="todo-dialog-heading">{{ initialTodo ? "Edit todo" : "Create todo" }}</h2>
      <form class="form form--two-column" @submit.prevent="handleSubmit">
        <div class="form__field">
          <label class="form__label" for="todo-title">Title</label>
          <input id="todo-title" v-model="formValues.title" type="text" class="form__input" required />
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-status">Status</label>
          <select id="todo-status" v-model="formValues.status" class="form__input">
            <option v-for="status in STATUS_OPTIONS" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <div class="form__field form__field--full">
          <label class="form__label" for="todo-description">Description</label>
          <textarea
            id="todo-description"
            v-model="formValues.description"
            class="form__input form__input--textarea"
            :rows="4"
          />
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-priority">Priority</label>
          <select id="todo-priority" v-model="formValues.priority" class="form__input">
            <option v-for="priority in PRIORITY_OPTIONS" :key="priority" :value="priority">{{ priority }}</option>
          </select>
        </div>
        <div class="form__field">
          <label class="form__checkbox">
            <input v-model="formValues.archived" type="checkbox" />
            Archived
          </label>
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-start">Start date</label>
          <input id="todo-start" v-model="formValues.start" type="date" class="form__input" />
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-end">End date</label>
          <input id="todo-end" v-model="formValues.end" type="date" class="form__input" />
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-duration">Duration</label>
          <input id="todo-duration" v-model="formValues.duration" type="number" min="0" class="form__input" />
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-is-default">Is default</label>
          <select id="todo-is-default" v-model="formValues.isDefault" class="form__input">
            <option value="">Unset</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-parent-id">Parent ID</label>
          <input id="todo-parent-id" v-model="formValues.parentId" type="text" class="form__input" />
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-children">Children</label>
          <input id="todo-children" v-model="formValues.children" type="text" class="form__input" />
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-owner">Owner</label>
          <input id="todo-owner" v-model="formValues.owner" type="text" class="form__input" />
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-tags">Tags</label>
          <input id="todo-tags" v-model="formValues.tags" type="text" class="form__input" />
        </div>
        <div class="form__field">
          <label class="form__label" for="todo-completed-at">Completed at</label>
          <input id="todo-completed-at" v-model="formValues.completedAt" type="date" class="form__input" />
        </div>
        <p v-if="error" class="form__error form__field--full" role="alert">{{ error }}</p>
        <div class="dialog__actions form__field--full">
          <button type="button" class="button button--secondary" @click="emit('close')">Cancel</button>
          <button type="submit" class="button button--primary" :disabled="isSubmitting">
            {{ isSubmitting ? "Saving..." : "Save" }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
