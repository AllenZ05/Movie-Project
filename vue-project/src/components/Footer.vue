<template>
  <footer class="container footer">
    <div>
      <RouterLink class="footer-brand" to="/"
        >123A Movies<span>A little less scrolling. A little more cinema.</span></RouterLink
      >
      <p>
        Movie data provided by
        <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>. This product
        uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </div>
    <a class="text-link" href="https://allenzhang05.com/" target="_blank" rel="noopener noreferrer"
      >Made by Allen ↗</a
    >
  </footer>
</template>
<style scoped>
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding-block: 2rem;
  margin-top: 4rem;
  border-top: 1px solid var(--border);
}
.footer-brand {
  font-family: "Manrope", sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
}
.footer-brand span {
  display: block;
  font-family: "DM Sans", sans-serif;
  font-weight: 400;
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.5rem;
}
.footer p {
  margin-top: 0.85rem;
  max-width: 600px;
  color: var(--text-muted);
  font-size: 0.65rem;
  line-height: 1.6;
}
.footer p a {
  text-decoration: underline;
}
.footer > a {
  flex-shrink: 0;
}
@media (max-width: 700px) {
  .footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin-top: 2.5rem;
  }
}
</style>
