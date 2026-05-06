<script setup lang="ts">
import { RouterLink } from "vue-router";
import Seo from "../shared/Seo.vue";
</script>

<template>
  <Seo title="404 Not Found" description="The page you requested was not found." />
  <section class="state-card" role="alert">
    <h1>404 - Page not found</h1>
    <p>The route you entered does not exist.</p>
    <RouterLink class="button button--primary" to="/todos">Go to todos</RouterLink>
  </section>
</template>
