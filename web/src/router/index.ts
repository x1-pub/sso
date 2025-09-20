import { createWebHistory, createRouter, type RouteLocation } from "vue-router";

import LoginForm from "@/components/LoginForm.vue";
import RegisterForm from "@/components/RegisterForm.vue";
import ErrorTips from "@/components/ErrorTips.vue";

const routes = [
  { path: "/", redirect: () => ({ path: "/login" }) },
  { path: "/login", component: LoginForm },
  { path: "/register", component: RegisterForm },
  { path: "/error", component: ErrorTips },
  {
    path: "/:pathMatch(.*)*",
    redirect: (to: RouteLocation) => ({
      path: "/error",
      query: { msg: `您刚刚访问了一个错误的地址: ${to.path}` },
    }),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
