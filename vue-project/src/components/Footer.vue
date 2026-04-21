<script setup></script>

<template>
  <footer>
    <a href="https://allenzhang05.com/" target="_blank" rel="noopener noreferrer"> AllenZ05 </a>
    <a href="https://allenzhang05.com/" target="_blank" rel="noopener noreferrer"> Contact </a>
  </footer>
</template>

<style scoped>
footer {
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

a {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s;
}

a:hover {
  color: #8ab4f8;
}

@media screen and (max-width: 768px) {
  footer {
    padding: 1.5rem;
  }
}
</style>
