<script setup></script>

<template>
  <footer>
    <a href="https://allenzhang05.com/" target="_blank" rel="noopener noreferrer"> AllenZ05 </a>
    <a href="https://allenzhang05.com/" target="_blank" rel="noopener noreferrer"> Contact </a>
  </footer>
</template>

<style scoped>
footer {
  padding: 1.75rem 2rem;
  background: var(--bg);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

a {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
}

a:hover {
  color: var(--accent);
}

@media screen and (max-width: 768px) {
  footer {
    padding: 1.5rem 1.25rem;
  }
}
</style>
