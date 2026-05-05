<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink to="/todos" class="brand">Altodo</RouterLink>
      <nav aria-label="Main navigation" class="nav">
        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/todos" class="nav__link" active-class="nav__link--active">All Tasks</RouterLink>
          <RouterLink to="/my-tasks" class="nav__link" active-class="nav__link--active">My Tasks</RouterLink>
          <RouterLink to="/test-error" class="nav__link" active-class="nav__link--active">
            Test Error Boundary
          </RouterLink>
          <button type="button" class="button button--secondary" @click="authStore.logout">Logout</button>
          <span class="nav__user" aria-label="Signed in user">{{ authStore.user?.email }}</span>
        </template>
        <template v-else>
          <RouterLink to="/login" class="nav__link" active-class="nav__link--active">Login</RouterLink>
          <RouterLink to="/signup" class="nav__link" active-class="nav__link--active">Sign up</RouterLink>
        </template>
      </nav>
    </div>
  </header>
  <main id="main-content" class="page-shell">
    <RouterView />
  </main>
</template>
