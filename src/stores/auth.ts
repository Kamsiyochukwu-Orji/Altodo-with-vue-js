import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getMe, login, persistAuthSession, register } from "../api/auth";
import { tokenStorage } from "../api/client";
import type { User } from "../types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isLoadingAuth = ref(true);
  let initializePromise: Promise<void> | null = null;

  const isAuthenticated = computed(() => Boolean(user.value));

  async function bootstrapSession(): Promise<void> {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    if (!accessToken && !refreshToken) {
      isLoadingAuth.value = false;
      return;
    }

    try {
      const currentUser = await getMe();
      user.value = currentUser;
    } catch {
      tokenStorage.clearTokens();
      user.value = null;
    } finally {
      isLoadingAuth.value = false;
    }
  }

  function initialize(): Promise<void> {
    if (!initializePromise) {
      initializePromise = bootstrapSession();
    }
    return initializePromise;
  }

  async function loginWithEmail(email: string, password: string): Promise<User | null> {
    const authResponse = await login({ email, password });
    const nextUser = persistAuthSession(authResponse);
    user.value = nextUser;
    return nextUser;
  }

  async function signupWithEmail(email: string, password: string, name: string): Promise<User | null> {
    const authResponse = await register({ email, password, name });
    const nextUser = persistAuthSession(authResponse);
    user.value = nextUser;
    return nextUser;
  }

  function logout(): void {
    tokenStorage.clearTokens();
    user.value = null;
  }

  return {
    user,
    isAuthenticated,
    isLoadingAuth,
    initialize,
    loginWithEmail,
    signupWithEmail,
    logout,
  };
});
