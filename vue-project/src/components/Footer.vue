<script setup></script>

<template>
  <footer>
    <div id="contact">
      <h4>CONTACT US</h4>
      <p>123-456-7890</p>
      <p>123AWebsite.com</p>
    </div>
    <h3>123A-MOVIES</h3>
    <div id="awards">
      <h4>AWARDS</h4>
      <p>Most used Movie Website 2023</p>
      <p class="sources">(WorldWebsitesReview)</p>
      <br />
      <p>Most 5 stars reviews by a Movie Website 2023</p>
      <p class="sources">(NY Times)</p>
    </div>
  </footer>
</template>

<style scoped>
footer {
  height: 20vh;
  color: white;
  background-color: black;

  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

footer h3 {
  font-size: 2.5rem;
}

#contact h4,
#awards h4 {
  font-size: 1.5rem;
  margin: 0.7rem;
}

.sources {
  font-size: 0.7em;
}
</style>
