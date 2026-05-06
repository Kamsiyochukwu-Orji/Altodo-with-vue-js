<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Seo from "../shared/Seo.vue";

const authStore = useAuthStore();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const isSubmitting = ref(false);

watch(
  [() => authStore.isAuthenticated, () => authStore.isLoadingAuth],
  ([isAuthenticated, isLoading]) => {
    if (!isLoading && isAuthenticated) {
      router.replace("/todos");
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  error.value = "";

  if (!name.value.trim()) {
    error.value = "Name is required.";
    return;
  }

  if (password.value.length < 6) {
    error.value = "Password must be at least 6 characters.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Password confirmation does not match.";
    return;
  }

  isSubmitting.value = true;

  try {
    await authStore.signupWithEmail(email.value.trim(), password.value, name.value.trim());
  } catch (signupError: unknown) {
    const err = signupError as { response?: { data?: { message?: string } }; message?: string };
    error.value = err?.response?.data?.message ?? err?.message ?? "Could not create account.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Seo title="Sign up" description="Create an account with email and password." />
  <section class="auth-shell">
    <article class="card auth-card">
      <h1>Create account</h1>
      <p class="state-card__subtle">Sign up with your name, email, and password.</p>
      <form class="form" @submit.prevent="handleSubmit">
        <label class="form__label" for="signup-name">Name</label>
        <input
          id="signup-name"
          v-model="name"
          type="text"
          class="form__input"
          autocomplete="name"
          required
        />
        <label class="form__label" for="signup-email">Email</label>
        <input
          id="signup-email"
          v-model="email"
          type="email"
          class="form__input"
          autocomplete="email"
          required
        />
        <label class="form__label" for="signup-password">Password</label>
        <input
          id="signup-password"
          v-model="password"
          type="password"
          class="form__input"
          autocomplete="new-password"
          required
        />
        <label class="form__label" for="signup-confirm-password">Confirm password</label>
        <input
          id="signup-confirm-password"
          v-model="confirmPassword"
          type="password"
          class="form__input"
          autocomplete="new-password"
          required
        />
        <p v-if="error" class="form__error" role="alert">{{ error }}</p>
        <button
          type="submit"
          class="button button--primary"
          :disabled="isSubmitting || authStore.isLoadingAuth"
        >
          {{ isSubmitting ? "Creating account..." : "Sign up" }}
        </button>
      </form>
      <p class="state-card__subtle">
        Already have an account? <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </article>
  </section>
</template>
