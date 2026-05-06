import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./stores/auth";

const AppLayout = () => import("./shared/AppLayout.vue");
const TodosPage = () => import("./views/TodosPage.vue");
const TodoDetailsPage = () => import("./views/TodoDetailsPage.vue");
const NotFoundPage = () => import("./views/NotFoundPage.vue");
const TestErrorPage = () => import("./views/TestErrorPage.vue");
const LoginPage = () => import("./views/LoginPage.vue");
const SignupPage = () => import("./views/SignupPage.vue");

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "", redirect: "/todos" },
        { path: "login", component: LoginPage },
        { path: "signup", component: SignupPage },
        {
          path: "todos",
          component: TodosPage,
          children: [{ path: ":todoId", component: TodoDetailsPage }],
        },
        {
          path: "my-tasks",
          component: TodosPage,
          meta: { requiresAuth: true },
          children: [{ path: ":todoId", component: TodoDetailsPage }],
        },
        { path: "test-error", component: TestErrorPage, meta: { requiresAuth: true } },
        { path: "logout", redirect: "/login" },
        { path: ":pathMatch(.*)*", component: NotFoundPage },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  await authStore.initialize();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: "/login", query: { from: to.fullPath } };
  }
});
