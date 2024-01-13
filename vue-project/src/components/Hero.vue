<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main>
    <h2>The number one movie website</h2>
    <p>Explore your favorite movies in one place! Stay updated with the latest and trending releases!</p>
    <button id="loginButton" @click="router.push('/login')">Login</button>
  </main>
</template>

<style scoped>
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}


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
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: fadeIn 2s ease-in-out;
}

p {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: fadeIn 2s ease-in-out;
}

h2, p {
  transition: transform 0.3s ease-in-out;
}

h2:hover, p:hover {
  transform: scale(1.2);
  color: #add8e6;
}

#loginButton {
  width: 150px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
  border-radius: 0.7rem;
  font-size: 1.2rem;

  transition: transform 0.3s ease-in-out;
}

#loginButton:hover {
  background-color: #be5f5f;
  transform: scale(1.1);
}

#loginButton:active {
  background-color: #921010;
}
</style>
