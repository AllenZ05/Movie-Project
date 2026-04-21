<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main>
    <div class="hero-content">
      <h2>The number one movie website</h2>
      <p>Explore your favorite movies in one place! Stay updated with the latest and trending releases!</p>
      <button id="loginButton" @click="router.push('/login')">Get Started</button>
    </div>
  </main>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
}

.hero-content {
  text-align: center;
  max-width: 700px;
  padding: 2rem;
}

h2 {
  color: white;
  font-size: 3rem;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6);
  animation: fadeIn 0.8s ease-out;
}

p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
  margin-bottom: 3rem;
  line-height: 1.6;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.8s ease-out 0.2s both;
}

#loginButton {
  padding: 1rem 2.5rem;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition:
    background-color 0.2s,
    transform 0.15s;
  animation: fadeIn 0.8s ease-out 0.4s both;
}

#loginButton:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

#loginButton:active {
  transform: translateY(0);
}

@media only screen and (max-width: 768px) {
  h2 {
    font-size: 2.2rem;
  }

  p {
    font-size: 1.1rem;
  }

  .hero-content {
    padding: 1rem;
  }
}
</style>
