<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store";

const store = useStore();
const router = useRouter();
const open = ref(false);
const menuRef = ref(null);

const logout = () => {
  store.logout();
  router.push("/");
};

const goToHistory = () => {
  open.value = false;
  router.push("/history");
};

const onClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    open.value = false;
  }
};

onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => document.removeEventListener("click", onClickOutside));
</script>

<template>
  <div class="user-menu" ref="menuRef">
    <button class="avatar-btn" @click="open = !open" aria-haspopup="menu" :aria-expanded="open" aria-label="Account">
      <img v-if="store.user?.photoURL" :src="store.user.photoURL" alt="" referrerpolicy="no-referrer" />
      <span v-else>{{ (store.user?.email || "?")[0].toUpperCase() }}</span>
    </button>
    <div v-if="open" class="dropdown" role="menu">
      <div class="user-email">{{ store.user?.email }}</div>
      <button class="menu-item" role="menuitem" @click="goToHistory">Watch History</button>
      <button class="menu-item danger" role="menuitem" @click="logout">Log out</button>
    </div>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--accent-strong);
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.2s;
}

.avatar-btn:hover {
  filter: brightness(1.15);
}

.avatar-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  padding: 0.5rem;
  z-index: 6;
}

.user-email {
  padding: 0.5rem 0.75rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.4rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 0.9rem;
  transition: background-color 0.15s, color 0.15s;
}

.menu-item:hover {
  background: var(--surface-hover);
}

.menu-item.danger:hover {
  background: var(--danger-soft);
  color: var(--danger);
}
</style>
