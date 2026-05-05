<script setup lang="ts">
defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  pageChange: [page: number];
}>();
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Todo list pages">
    <button
      type="button"
      class="button button--secondary"
      :disabled="currentPage === 1"
      @click="emit('pageChange', currentPage - 1)"
    >
      Previous
    </button>
    <p class="pagination__status" aria-live="polite">Page {{ currentPage }} of {{ totalPages }}</p>
    <button
      type="button"
      class="button button--secondary"
      :disabled="currentPage === totalPages"
      @click="emit('pageChange', currentPage + 1)"
    >
      Next
    </button>
  </nav>
</template>
