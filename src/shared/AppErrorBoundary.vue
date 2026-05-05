<script setup lang="ts">
import { onErrorCaptured, ref } from "vue";

const hasError = ref(false);
const errorMessage = ref("");

onErrorCaptured((error) => {
  hasError.value = true;
  errorMessage.value = (error as Error).message ?? "";
  console.error("Unhandled application error:", error);
  return false;
});
const handleWindow = () => window.location.reload();
</script>

<template>
  <main v-if="hasError" class="state-card" role="alert">
    <h1>Something went wrong</h1>
    <p>There was an unexpected application error.</p>
    <p v-if="errorMessage" class="state-card__subtle">{{ errorMessage }}</p>
    <button type="button" class="button button--primary" @click="handleWindow">
      Reload app
    </button>
  </main>
  <slot v-else />
</template>
