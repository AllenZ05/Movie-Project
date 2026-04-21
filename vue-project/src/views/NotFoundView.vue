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
  color: rgba(255, 255, 255, 0.15);
  line-height: 1;
}

p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.5);
}

button {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background-color: #8ab4f8;
  color: #1a1a2e;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #aecbfa;
}
</style>
