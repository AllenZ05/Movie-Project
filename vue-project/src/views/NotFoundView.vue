<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main>
    <h1>404</h1>
    <p>This page doesn't exist.</p>
    <button @click="router.push('/')">Go Home</button>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  gap: 1rem;
}

h1 {
  font-size: 6rem;
  font-weight: 800;
  line-height: 1;
  color: rgba(255, 255, 255, 0.15);
}

p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.5);
}

button {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: var(--accent-strong);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 600;
  transition: filter 0.2s;
}

button:hover {
  filter: brightness(1.15);
}
</style>
