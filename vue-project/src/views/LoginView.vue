<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store";
import { auth, firestore } from "../firebase";
import { getDoc, doc, setDoc } from "@firebase/firestore";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";

const store = useStore();
const router = useRouter();
const emailRegister = ref("");
const emailLogin = ref("");
const passwordRegister = ref("");
const passwordConfirm = ref("");
const passwordLogin = ref("");

const registerViaEmail = async () => {
  if (passwordRegister.value !== passwordConfirm.value) {
    alert("Passwords don't match!");
    return;
  }

  const { user } = await createUserWithEmailAndPassword(auth, emailRegister.value, passwordRegister.value);

  await setDoc(doc(firestore, "carts", user.email), { cart: [] });

  store.user = user;
  emailLogin.value = emailRegister.value;
  passwordLogin.value = passwordRegister.value;
  router.push("/purchase");
};

const loginViaEmail = async () => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, emailLogin.value, passwordLogin.value);
    store.user = user;
    const cartDoc = await getDoc(doc(firestore, "carts", user.email));

    if (cartDoc.exists()) {
      store.cart = cartDoc.data().cart;
    } else {
      store.cart = [];
    }
    router.push("/purchase");
  } catch (error) {
    console.log(error);
  }
};

const registerViaGoogle = async () => {
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
  store.user = user;
  const cartDoc = await getDoc(doc(firestore, "carts", user.email));

  if (cartDoc.exists()) {
    store.cart = cartDoc.data().cart;
  } else {
    await setDoc(doc(firestore, "carts", user.email), { cart: [] });
    store.cart = [];
  }
  router.push("/purchase");
};
</script>

<template>
  <main>
    <div class="auth-container">
      <h2>Register/Login via Google</h2>
      <button id="auth-button" @click="registerViaGoogle()">Google</button>
    </div>
    <div class="email-container">
      <h2>Register via Email</h2>
      <form class="setup" @submit.prevent="registerViaEmail()">
        <input v-model="emailRegister" type="email" placeholder="Email" />
        <input v-model="passwordRegister" type="password" placeholder="Enter Password" />
        <input v-model="passwordConfirm" type="password" placeholder="Re-enter Password" />
        <input type="submit" value="Register" />
      </form>
      <hr id="divider" />
      <h2>Login via Email</h2>
      <form class="login" @submit.prevent="loginViaEmail()">
        <input v-model="emailLogin" type="email" placeholder="Email" />
        <input v-model="passwordLogin" type="password" placeholder="Password" />
        <input type="submit" value="Login" />
      </form>
    </div>
  </main>
</template>

<style scoped>
main {
  background-image: url(../assets/LoginView.jpg);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;

  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-container,
.email-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

input[type="email"],
input[type="password"] {
  width: 50%;
  padding: 1rem;
  border-radius: 0.5em;
  background-color: #f2f2f2;
  font-size: 1rem;
}

#auth-button,
input[type="submit"] {
  padding: 1rem;
  border-radius: 0.5em;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  margin: 0.2rem;
  cursor: pointer;
}

#auth-button {
  width: 20%;
}

input[type="submit"] {
  width: 50%;
}

h2 {
  color: silver;
}

#divider {
  height: 2rem;
  background-color: silver;
  border: none;
  margin: 2rem 0;
}
</style>
