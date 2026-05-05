<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@vueuse/head";

const props = defineProps<{
  title?: string;
  description?: string;
}>();

useHead({
  title: computed(() => (props.title ? `${props.title} | Altodo` : "Altodo")),
  meta: computed(() =>
    props.description ? [{ name: "description", content: props.description }] : []
  ),
});
</script>

<template></template>
