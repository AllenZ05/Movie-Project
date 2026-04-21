import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import PurchaseView from "../views/PurchaseView.vue";
import CartView from "../views/CartView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import { useStore } from "../store";

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      path: "/",
      component: HomeView,
    },
    {
      path: "/login",
      component: LoginView,
    },
    {
      path: "/purchase",
      component: PurchaseView,
      meta: { requiresAuth: true },
    },
    {
      path: "/cart",
      component: CartView,
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      component: NotFoundView,
    },
  ],
});

router.beforeEach((to) => {
  const store = useStore();

  if (to.meta.requiresAuth && !store.user) {
    return "/login";
  }

  if (to.path === "/login" && store.user) {
    return "/purchase";
  }
});
