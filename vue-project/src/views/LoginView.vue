<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store";
import { auth, firestore } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
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
const isLoading = ref(false);
const errorMessage = ref("");
const isLoginMode = ref(true);

// Navigate away once auth state updates after sign-in
watch(() => store.user, (user) => {
  if (user) router.push("/purchase");
});

const registerViaEmail = async () => {
  errorMessage.value = "";
  if (passwordRegister.value !== passwordConfirm.value) {
    errorMessage.value = "Passwords don't match!";
    return;
  }
  if (passwordRegister.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters.";
    return;
  }

  isLoading.value = true;
  try {
    const { user } = await createUserWithEmailAndPassword(auth, emailRegister.value, passwordRegister.value);
    await setDoc(doc(firestore, "carts", user.email), { cart: [] });
  } catch (error) {
    errorMessage.value =
      error.code === "auth/email-already-in-use"
        ? "This email is already registered. Try signing in with Google instead."
        : error.code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : "Registration failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const loginViaEmail = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    await signInWithEmailAndPassword(auth, emailLogin.value, passwordLogin.value);
  } catch (error) {
    errorMessage.value =
      error.code === "auth/invalid-credential"
        ? "Invalid email or password."
        : error.code === "auth/user-not-found"
          ? "No account found with this email."
          : "Login failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const registerViaGoogle = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (error) {
    if (error.code !== "auth/popup-closed-by-user") {
      errorMessage.value = "Google sign-in failed. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main>
    <div class="login-card">
      <h1 class="brand">123A-Movies</h1>

      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <div class="auth-section">
        <button id="auth-button" @click="registerViaGoogle()" :disabled="isLoading">Sign in with Google</button>
      </div>

      <div class="divider"><span>or</span></div>

      <!-- Login Form -->
      <form v-if="isLoginMode" class="auth-form" @submit.prevent="loginViaEmail()">
        <input v-model="emailLogin" type="email" placeholder="Email" required autocomplete="email" />
        <input
          v-model="passwordLogin"
          type="password"
          placeholder="Password"
          required
          autocomplete="current-password"
        />
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? "Logging in..." : "Login" }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-else class="auth-form" @submit.prevent="registerViaEmail()">
        <input v-model="emailRegister" type="email" placeholder="Email" required autocomplete="email" />
        <input
          v-model="passwordRegister"
          type="password"
          placeholder="Password"
          required
          autocomplete="new-password"
        />
        <input
          v-model="passwordConfirm"
          type="password"
          placeholder="Confirm Password"
          required
          autocomplete="new-password"
        />
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? "Registering..." : "Register" }}
        </button>
      </form>

      <p class="toggle-mode">
        {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
        <span @click="isLoginMode = !isLoginMode; errorMessage = ''">
          {{ isLoginMode ? "Register" : "Login" }}
        </span>
      </p>
    </div>
  </main>
</template>

<style scoped>
main {
  background-image: url(../assets/LoginView.jpg);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.login-card {
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.brand {
  color: white;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.error-banner {
  background-color: #ff5555;
  color: white;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

#auth-button {
  width: 100%;
  padding: 0.85rem;
  border-radius: 6px;
  background-color: #4285f4;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

#auth-button:hover:not(:disabled) {
  background-color: #3367d6;
}

#auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.5);
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider span {
  padding: 0 1rem;
  font-size: 0.85rem;
}

.toggle-mode {
  margin-top: 1.25rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.toggle-mode span {
  color: #8ab4f8;
  cursor: pointer;
  font-weight: 600;
}

.toggle-mode span:hover {
  text-decoration: underline;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 0.75rem;
}

.auth-form input[type="email"],
.auth-form input[type="password"] {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.auth-form input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.auth-form input:focus {
  outline: none;
  border-color: #4285f4;
}

.auth-form button {
  padding: 0.85rem;
  border-radius: 6px;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
  margin-top: 0.25rem;
}

.auth-form button:hover:not(:disabled) {
  background-color: #0056b3;
}

.auth-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media only screen and (max-width: 480px) {
  .login-card {
    padding: 1.5rem 1.25rem;
  }

  .brand {
    font-size: 1.5rem;
  }
}
</style>
