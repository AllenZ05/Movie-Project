<script setup></script>

<template>
  <footer>
    <a href="https://allenzhang05.com/" target="_blank" class="contact-link"><h4>AllenZ05</h4></a>
    <a href="https://allenzhang05.com/" target="_blank" class="contact-link"><h4>Contact</h4></a>
  </footer>
</template>

<style scoped>
footer {
  height: 15vh;
  color: white;
  background-color: black;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

.contact-link {
  font-size: 2.5rem;
  color: white;
  text-decoration: none;
}

.contact-link:hover {
  color: blue;
}

/* Media Queries */

@media screen and (max-width: 768px) {
  .contact-link {
    font-size: 1.5rem;
  }
}
</style>
