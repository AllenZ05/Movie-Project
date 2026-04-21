<script setup>
import { useStore } from "./store";

const store = useStore();
store.initAuth();
</script>

<template>
  <div v-if="!store.authReady" class="app-loading">
    <div class="spinner"></div>
  </div>
  <RouterView v-else />
</template>

<style scoped>
.app-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #8ab4f8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
