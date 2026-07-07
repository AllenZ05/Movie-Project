<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <header>
    <h1>123A-MOVIES</h1>
    <button class="signin-button" @click="router.push('/login')">Sign In</button>
  </header>
</template>

<style scoped>
header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
}

h1 {
  font-size: 1.6rem;
  letter-spacing: 0.12em;
  font-weight: 800;
  color: white;
}

.signin-button {
  padding: 0.55rem 1.4rem;
  border-radius: var(--radius-sm);
  background: var(--accent-strong);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  transition:
    filter 0.2s,
    transform 0.15s;
}

.signin-button:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}

@media screen and (max-width: 768px) {
  header {
    padding: 1rem 1.25rem;
  }

  h1 {
    font-size: 1.25rem;
  }
}
</style>
