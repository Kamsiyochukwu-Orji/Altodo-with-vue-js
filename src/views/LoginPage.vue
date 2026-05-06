<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Seo from "../shared/Seo.vue";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const redirectPath = (route.query.from as string) || "/todos";

const email = ref("");
const password = ref("");
const error = ref("");
const isSubmitting = ref(false);

watch(
  [() => authStore.isAuthenticated, () => authStore.isLoadingAuth],
  ([isAuthenticated, isLoading]) => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  error.value = "";
  isSubmitting.value = true;

  try {
    await authStore.loginWithEmail(email.value.trim(), password.value);
  } catch (loginError: unknown) {
    const err = loginError as { response?: { data?: { message?: string } }; message?: string };
    error.value = err?.response?.data?.message ?? err?.message ?? "Could not sign in with those credentials.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Seo title="Login" description="Sign in with your email and password to access your tasks." />
  <section class="auth-shell">
    <article class="card auth-card">
      <h1>Login</h1>
      <p class="state-card__subtle">Use your account email and password.</p>
      <form class="form" @submit.prevent="handleSubmit">
        <label class="form__label" for="login-email">Email</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          class="form__input"
          autocomplete="email"
          required
        />
        <label class="form__label" for="login-password">Password</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          class="form__input"
          autocomplete="current-password"
          required
        />
        <p v-if="error" class="form__error" role="alert">{{ error }}</p>
        <button
          type="submit"
          class="button button--primary"
          :disabled="isSubmitting || authStore.isLoadingAuth"
        >
          {{ isSubmitting ? "Signing in..." : "Sign in" }}
        </button>
      </form>
      <p class="state-card__subtle">
        Need an account? <RouterLink to="/signup">Create one</RouterLink>
      </p>
    </article>
  </section>
</template>
