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
  flex-direction: column;
  height: 15vh;
  color: white;
  background-color: black;
  text-align: center;
}

h1 {
  font-size: 5rem;
  margin: 1rem;
}

/* Media Queries */

@media screen and (max-width: 768px) {
  h1 {
    font-size: 3rem;
  }
}
</style>
