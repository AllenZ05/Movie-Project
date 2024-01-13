<script setup>
import { useStore } from "../store/index.js";
import { useRouter } from "vue-router";

import { updateDoc, doc } from "firebase/firestore";
import { firestore } from "../firebase";

const router = useRouter();
const store = useStore();

const removeFromCart = (index) => {
  store.cart.splice(index, 1);
  updateDoc(doc(firestore, "carts", store.user.email), {
    cart: store.cart,
  });
};
</script>

<template>
  <div id="container">
    <h4>Cart</h4>
    <button class="back-button" @click="router.push('/purchase')">Back</button>
    <div v-for="(movie, index) in store.cart" :key="movie.id" class="movie-item">
      <div class="movie-number">{{ index + 1 }}</div>
      <h1>{{ movie.title }}</h1>
      <img :src="`https://image.tmdb.org/t/p/w500/${movie.poster}`" />
      <button class="delete-button" @click="removeFromCart(index)">Delete</button>
    </div>
  </div>
</template>

<style scoped>
#container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  background-color: black;
  min-height: 100vh; 
  padding-bottom: 1rem; 
}

h4 {
  font-size: 3rem;
  margin: 1rem;
}

.back-button,
.delete-button {
  width: 150px;
  height: 50px;
  background-color: #333;
  color: white;
  border-radius: 0.3rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.back-button:hover,
.delete-button:hover {
  background-color: #555;
}

.back-button:focus,
.delete-button:focus {
  outline: none;
}

.movie-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.movie-number {
  font-size: 2rem;
  border: 0.2rem solid white;
  border-radius: 50%;
  margin: 0.2rem 0 0.2rem 0.2rem;
  padding: 0.5rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

img {
  display: block;
  margin-top: 1rem;
  max-width: 100%;
}

.delete-button {
  background-color: red;
  color: white;
  border: none;
  border-radius: 0.3rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.delete-button:hover {
  background-color: darkred;
}

.delete-button:focus {
  outline: none;
}
</style>
