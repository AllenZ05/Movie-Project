<script setup>
import { useRoute } from "vue-router";
import { useStore } from "../store";
import Icon from "./Icon.vue";
import UserMenu from "./UserMenu.vue";
const route = useRoute();
const store = useStore();
const links = [
  { path: "/", label: "Discover", icon: "compass" },
  { path: "/watchlist", label: "Watchlist", icon: "bookmark" },
  { path: "/history", label: "History", icon: "clock" },
];
const active = (path) => (path === "/" ? ["/", "/browse"].includes(route.path) : route.path === path);
</script>
<template>
  <header class="site-header">
    <div class="header-inner container">
      <RouterLink class="brand" to="/" aria-label="123A Movies home"
        ><span class="brand-mark"><Icon name="play" :size="17" /></span
        ><span>123A<span class="brand-secondary">Movies</span></span></RouterLink
      >
      <nav class="desktop-nav" aria-label="Main navigation">
        <RouterLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          :class="{ active: active(link.path) }"
          :aria-current="active(link.path) ? 'page' : undefined"
          >{{ link.label
          }}<span v-if="link.path === '/watchlist' && store.watchlistCount" class="nav-count">{{
            store.watchlistCount
          }}</span></RouterLink
        >
      </nav>
      <div class="header-actions">
        <RouterLink class="search-link icon-button" to="/browse" aria-label="Search movies and TV shows"
          ><Icon name="search" /></RouterLink
        ><UserMenu v-if="store.user" /><RouterLink
          v-else
          class="button signin-link"
          :to="{ path: '/login', query: { redirect: route.fullPath } }"
          >Sign in <Icon name="arrow" :size="16"
        /></RouterLink>
      </div>
    </div>
  </header>
  <nav class="mobile-nav" aria-label="Mobile navigation">
    <RouterLink
      v-for="link in links"
      :key="link.path"
      :to="link.path"
      :class="{ active: active(link.path) }"
      :aria-current="active(link.path) ? 'page' : undefined"
      ><Icon :name="link.icon" :size="21" /><span>{{ link.label }}</span></RouterLink
    >
  </nav>
</template>
<style scoped>
.site-header {
  height: var(--header-height);
  position: sticky;
  top: 0;
  z-index: 8;
  background: #0b0d14e8;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #ffffff08;
}
.header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.06em;
  white-space: nowrap;
}
.brand-secondary {
  font-weight: 500;
  margin-left: 0.3rem;
  letter-spacing: -0.04em;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  color: #c7daff;
  background: #3975ee2b;
  border: 1px solid #659afa44;
  border-radius: 9px;
}
.desktop-nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}
.desktop-nav a {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.83rem;
  min-height: 44px;
  color: var(--text-muted);
  position: relative;
}
.desktop-nav a.active {
  color: white;
}
.desktop-nav a.active::after {
  content: "";
  position: absolute;
  height: 3px;
  width: 16px;
  border-radius: 3px;
  bottom: 0;
  left: calc(50% - 8px);
  background: var(--accent);
}
.nav-count {
  font-size: 0.65rem;
  color: var(--accent);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.search-link {
  background: transparent;
  color: var(--text-secondary);
}
.signin-link {
  min-height: 38px;
  padding: 0.5rem 0.85rem;
  font-size: 0.77rem;
}
.mobile-nav {
  display: none;
}
@media (max-width: 700px) {
  .brand {
    font-size: 1.03rem;
    gap: 0.5rem;
  }
  .brand-mark {
    width: 28px;
    height: 28px;
  }
  .desktop-nav {
    display: none;
  }
  .header-actions {
    gap: 0.25rem;
  }
  .search-link {
    display: none;
  }
  .signin-link {
    min-height: 44px;
  }
  .signin-link .icon {
    display: none;
  }
  .mobile-nav {
    display: flex;
    justify-content: space-around;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9;
    padding: 0.45rem 1rem calc(0.45rem + env(safe-area-inset-bottom));
    background: #11151ff5;
    border-top: 1px solid var(--border);
    backdrop-filter: blur(20px);
  }
  .mobile-nav a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    font-size: 0.64rem;
    font-weight: 550;
    color: var(--text-muted);
    min-width: 70px;
    min-height: 48px;
  }
  .mobile-nav a.active {
    color: var(--accent);
  }
}
</style>
