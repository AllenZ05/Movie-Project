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
      <img :src="`https://image.tmdb.org/t/p/w500/${movie.poster}`" class="movie-poster" />
      <button class="delete-button" @click="removeFromCart(index)">Delete</button>
    </div>
  </div>
</template>

<style scoped>
#container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: #f3f3f3;
  background-color: #1a1a1d;
  min-height: 100vh;
  padding: 1rem 0;
  text-align: center;
}

.movie-item {
  background-color: #242424;
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem auto;
  max-width: 40rem;
  width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

h4 {
  font-size: 2.5rem;
  margin: 1rem;
  color: #eaeaea;
}

.back-button,
.delete-button {
  width: 150px;
  height: 40px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 0.3rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
}

.back-button:hover,
.delete-button:hover {
  background-color: #66bb6a;
}

.back-button:focus,
.delete-button:focus {
  outline: none;
}

.movie-number {
  font-size: 1.5rem;
  color: #eaeaea;
  background-color: #333;
  border-radius: 50%;
  padding: 0.5rem;
  width: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.movie-poster {
  margin-top: 1rem;
  max-width: 100%;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.delete-button {
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 0.3rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}
.delete-button:hover {
  background-color: #ff5252;
}

.back-button,
.delete-button {
  font-family: "Roboto", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
}
</style>
