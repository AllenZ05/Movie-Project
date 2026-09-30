<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store";
import Icon from "./Icon.vue";
const store = useStore();
const router = useRouter();
const open = ref(false);
const menuRef = ref(null);
const trigger = ref(null);
const photoFailed = ref(false);
watch(
  () => store.user?.photoURL,
  () => {
    photoFailed.value = false;
  }
);
const close = () => {
  open.value = false;
  trigger.value?.focus();
};
const outside = (event) => {
  if (!menuRef.value?.contains(event.target)) open.value = false;
};
const logout = async () => {
  if (await store.logout()) {
    open.value = false;
    router.push("/");
  }
};
onMounted(() => document.addEventListener("pointerdown", outside));
onUnmounted(() => document.removeEventListener("pointerdown", outside));
</script>
<template>
  <div
    ref="menuRef"
    class="user-menu"
    @keydown.esc.stop="close"
    @focusout="
      (event) => {
        if (!menuRef.contains(event.relatedTarget)) open = false;
      }
    "
  >
    <button
      ref="trigger"
      class="avatar-btn icon-button"
      @click="open = !open"
      :aria-expanded="open"
      aria-controls="account-panel"
      aria-label="Your account"
    >
      <img
        v-if="store.user?.photoURL && !photoFailed"
        :src="store.user.photoURL"
        @error="photoFailed = true"
        alt=""
        referrerpolicy="no-referrer"
      /><span v-else>{{ (store.user?.email || "?")[0].toUpperCase() }}</span>
    </button>
    <div v-if="open" id="account-panel" class="account-panel">
      <p class="eyebrow">YOUR ACCOUNT</p>
      <p class="user-email">{{ store.user?.email }}</p>
      <button class="button quiet" @click="logout"><Icon name="logout" :size="18" /> Sign out</button>
    </div>
  </div>
</template>
<style scoped>
.user-menu {
  position: relative;
}
.avatar-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  background: #283958;
  color: #cbdcff;
  border: 1px solid #ffffff14;
  overflow: hidden;
  font-size: 0.85rem;
}
.avatar-btn img {
  display: block;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}
.account-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: min(270px, calc(100vw - 36px));
  border-radius: 12px;
  padding: 1.2rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}
.user-email {
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0.6rem 0 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.account-panel .button {
  width: 100%;
  justify-content: flex-start;
}
</style>
