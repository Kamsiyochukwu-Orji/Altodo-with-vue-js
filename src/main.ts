import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import { createHead } from "@vueuse/head";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { useAuthStore } from "./stores/auth";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const app = createApp(App);
const pinia = createPinia();
const head = createHead();

app.use(pinia);

// Kick off auth initialization before router starts processing routes
const authStore = useAuthStore();
authStore.initialize();

app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.use(head);

app.mount("#root");
