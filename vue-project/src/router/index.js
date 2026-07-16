import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useStore } from "../store";

const LoginView = () => import("../views/LoginView.vue");
const PurchaseView = () => import("../views/PurchaseView.vue");
const WatchlistView = () => import("../views/WatchlistView.vue");
const HistoryView = () => import("../views/HistoryView.vue");
const NotFoundView = () => import("../views/NotFoundView.vue");

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    // Query-only changes (e.g. opening a movie modal) shouldn't scroll
    if (to.path === from.path) return false;
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
      path: "/watchlist",
      component: WatchlistView,
      meta: { requiresAuth: true },
    },
    {
      path: "/history",
      component: HistoryView,
      meta: { requiresAuth: true },
    },
    // Old paths from the cart/checkout era
    { path: "/cart", redirect: "/watchlist" },
    { path: "/orders", redirect: "/history" },
    {
      path: "/:pathMatch(.*)*",
      component: NotFoundView,
    },
  ],
});

router.beforeEach((to) => {
  const store = useStore();

  if (to.meta.requiresAuth && !store.user) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (to.path === "/login" && store.user) {
    const redirect = to.query.redirect;
    return typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/purchase";
  }
});
