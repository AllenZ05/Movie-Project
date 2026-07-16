<script setup>
import { useStore } from "../store";

const store = useStore();
</script>

<template>
  <Teleport to="body">
    <div class="toasts" aria-live="polite">
      <TransitionGroup name="toast">
        <button
          v-for="toast in store.toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
          @click="store.dismissToast(toast.id)"
        >
          {{ toast.message }}
        </button>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 20;
  width: max-content;
  max-width: calc(100vw - 2rem);
}

.toast {
  padding: 0.75rem 1.25rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  color: var(--text);
  font-size: 0.9rem;
  text-align: left;
  max-width: 100%;
}

.toast.success {
  border-color: rgba(52, 211, 153, 0.4);
}

.toast.error {
  border-color: rgba(248, 113, 113, 0.4);
  color: var(--danger);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
