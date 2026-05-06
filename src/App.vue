<script setup lang="ts">
import AppErrorBoundary from "./shared/AppErrorBoundary.vue";
</script>

<template>
  <AppErrorBoundary>
    <RouterView />
  </AppErrorBoundary>
</template>
