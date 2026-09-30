<script setup>
import { useStore } from "../store";
import Icon from "./Icon.vue";
const store = useStore();
const undo = async (toast) => {
  store.dismissToast(toast.id);
  await toast.action();
};
</script>
<template>
  <div class="toasts" aria-live="polite" aria-relevant="additions text">
    <TransitionGroup name="toast">
      <div v-for="toast in store.toasts" :key="toast.id" class="toast" :class="toast.type">
        <Icon :name="toast.type === 'error' ? 'close' : 'check'" :size="18" /><span>{{ toast.message }}</span
        ><button v-if="toast.action" class="undo" @click="undo(toast)">Undo</button
        ><button
          class="toast-dismiss icon-button"
          @click="store.dismissToast(toast.id)"
          aria-label="Dismiss notification"
        >
          <Icon name="close" :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
<style scoped>
.toasts {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 20;
  width: max-content;
  max-width: calc(100vw - 2rem);
}
.toast {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.4rem 0.4rem 0.4rem 1rem;
  background: #252e3d;
  border: 1px solid #ffffff26;
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  font-size: 0.82rem;
}
.toast > .icon {
  color: var(--success);
}
.toast.error > .icon,
.toast.error {
  color: var(--danger);
}
.toast span {
  max-width: 380px;
}
.toast-dismiss {
  width: 44px;
  height: 44px;
  background: transparent;
}
.undo {
  background: transparent;
  color: var(--accent);
  min-height: 44px;
  padding: 0 0.5rem;
  font-weight: 700;
}
.toast-enter-active,
.toast-leave-active {
  transition: transform 0.2s, opacity 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (max-width: 700px) {
  .toasts {
    bottom: calc(85px + env(safe-area-inset-bottom));
  }
}
</style>
