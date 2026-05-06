<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  throw new Error("Intentional test error for AppErrorBoundary.");
});
</script>

<template>
  <div></div>
</template>
