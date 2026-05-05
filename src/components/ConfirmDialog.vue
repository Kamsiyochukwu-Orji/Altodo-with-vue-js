<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();
</script>

<template>
  <div v-if="open" class="dialog-backdrop" role="presentation" @click="emit('cancel')">
    <section
      class="dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-heading"
      @click.stop
    >
      <h2 id="confirm-dialog-heading">{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="dialog__actions">
        <button type="button" class="button button--secondary" @click="emit('cancel')">Cancel</button>
        <button type="button" class="button button--danger" :disabled="isLoading" @click="emit('confirm')">
          {{ isLoading ? "Deleting..." : confirmText }}
        </button>
      </div>
    </section>
  </div>
</template>
