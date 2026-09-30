<script setup>
import Icon from "../components/Icon.vue";
</script>
<template>
  <main id="main-content" class="container not-found" tabindex="-1">
    <p class="eyebrow">404 · SCENE NOT FOUND</p>
    <h1>This story took a turn.</h1>
    <p>The page you’re looking for isn’t here. There are plenty of good stories that are.</p>
    <RouterLink class="button primary" to="/browse"
      >Back to exploring <Icon name="arrow" :size="18"
    /></RouterLink>
  </main>
</template>
<style scoped>
.not-found {
  min-height: 75dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  text-align: center;
}
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}
p:not(.eyebrow) {
  max-width: 430px;
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 0.9rem;
}
</style>
