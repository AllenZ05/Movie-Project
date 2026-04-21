<script setup></script>

<template>
  <header>
    <h1>123A-MOVIES</h1>
  </header>
</template>

<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 12vh;
  color: white;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  text-align: center;
}

h1 {
  font-size: 4rem;
  letter-spacing: 0.15em;
  font-weight: 800;
}

@media screen and (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }
}
</style>
