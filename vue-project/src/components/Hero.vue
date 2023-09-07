<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main>
    <h2>The number one website to buy movies</h2>
    <button id="loginButton" @click="router.push('/login')">Login</button>
  </main>
</template>

<style scoped>
main {
  background-image: url(../assets/HeroPage.jpg);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

h2 {
  color: white;
  font-size: 3rem;

  margin-bottom: 5rem;
}

#loginButton {
  width: 150px;
  height: 50px;
}
</style>
