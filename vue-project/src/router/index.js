import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useStore } from "../store";
import { safeRedirect } from "../lib/media.js";

const LoginView = () => import("../views/LoginView.vue");
const BrowseView = () => import("../views/BrowseView.vue");
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
      path: "/browse",
      component: BrowseView,
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
    // Keep the query so old shared ?movie= deep links still open the modal
    { path: "/purchase", redirect: (to) => ({ path: "/browse", query: to.query }) },
    {
      path: "/:pathMatch(.*)*",
      component: NotFoundView,
    },
  ],
});

router.beforeEach(async (to) => {
  const store = useStore();
  if (to.meta.requiresAuth || to.path === "/login") await store.initAuth();

  if (to.meta.requiresAuth && !store.user) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (to.path === "/login" && store.user) {
    const redirect = to.query.redirect;
    return safeRedirect(redirect);
  }
});

router.afterEach((to) => {
  const titles = {
    "/": "Discover your next great watch",
    "/browse": "Explore",
    "/watchlist": "Your watchlist",
    "/history": "Your watch history",
    "/login": "Welcome back",
  };
  document.title = `${titles[to.path] || "Page not found"} · 123A Movies`;
});
