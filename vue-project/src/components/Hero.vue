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
  position: relative;
  background-image: url(../assets/HeroPage.jpg);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

main::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(13, 13, 31, 0.3) 0%, rgba(13, 13, 31, 0.55) 70%, var(--bg) 100%),
    radial-gradient(ellipse at center, transparent 0%, rgba(13, 13, 31, 0.4) 100%);
}

.hero-content {
  position: relative;
  text-align: center;
  max-width: 760px;
  padding: 2rem;
}

h2 {
  color: white;
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6);
  animation: fadeIn 0.8s ease-out;
}

p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.8s ease-out 0.2s both;
}

#loginButton {
  padding: 1rem 2.75rem;
  background: var(--accent-strong);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
  transition:
    filter 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
  animation: fadeIn 0.8s ease-out 0.4s both;
}

#loginButton:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.45);
}

#loginButton:active {
  transform: translateY(0);
}

@media only screen and (max-width: 768px) {
  h2 {
    font-size: 2.4rem;
  }

  p {
    font-size: 1.1rem;
  }

  .hero-content {
    padding: 1rem;
  }
}
</style>
