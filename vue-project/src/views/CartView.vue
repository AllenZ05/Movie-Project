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
    <button id="back-button" @click="router.push('/purchase')">Back</button>
    <div v-for="(movie, index) in store.cart" :key="movie.id">
      <div id="movieTitleAndNumber">
        <div id="movie-number">{{ index + 1 }}</div>
        <h1>{{ movie.title }}</h1>
      </div>
      <img :src="`https://image.tmdb.org/t/p/w500/${movie.poster}`" />
      <button id="delete-button" @click="removeFromCart(index)">Delete</button>
    </div>
  </div>
</template>

<style scoped>
#container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  background-color: black;
}

#container h4 {
  font-size: 3rem;
  margin: 1rem 1rem 3rem 1rem;
}

#back-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 150px;
  height: 50px;
  background-color: #333;
  color: white;
  border-radius: 0.3rem;
  font-size: 1rem;
  cursor: pointer;
}

#back-button:hover {
  background-color: #555;
}

#back-button:focus {
  outline: none;
}

#movieTitleAndNumber {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
}

#movie-number {
  font-size: 2rem;
  border: 0.2rem solid white;
  border-radius: 50%;
  margin: 0.2rem 1rem 0.2rem 0.2rem;
  padding: 0.5rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

img {
  display: block;
  margin: 0 auto;
}

#delete-button {
  background-color: red;
  color: white;
  border: none;
  border-radius: 0.3rem;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
  display: block;
  margin: 0 auto;
}

#delete-button:hover {
  background-color: darkred;
}

#delete-button:focus {
  outline: none;
}
</style>
../firebase/index.js
