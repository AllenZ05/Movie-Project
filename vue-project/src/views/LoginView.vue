<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "../store";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { safeRedirect, imageUrl } from "../lib/media";
import { getTitles } from "../lib/tmdb";
import Icon from "../components/Icon.vue";
const store = useStore();
const router = useRouter();
const route = useRoute();
const email = ref("");
const password = ref("");
const confirmation = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const isLoginMode = ref(true);
const posters = ref([]);
const controller = new AbortController();
const goAfterAuth = (user) => {
  store.setSession(user);
  router.push(safeRedirect(route.query.redirect));
};
const submit = async () => {
  errorMessage.value = "";
  if (!isLoginMode.value && password.value !== confirmation.value) {
    errorMessage.value = "Your passwords don’t match yet.";
    return;
  }
  if (!isLoginMode.value && password.value.length < 6) {
    errorMessage.value = "Choose a password with at least 6 characters.";
    return;
  }
  isLoading.value = true;
  try {
    const { user } = await (isLoginMode.value ? signInWithEmailAndPassword : createUserWithEmailAndPassword)(
      auth,
      email.value.trim(),
      password.value
    );
    goAfterAuth(user);
  } catch (error) {
    errorMessage.value =
      error.code === "auth/email-already-in-use"
        ? "An account already uses this email. Try signing in instead."
        : ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(error.code)
        ? "The email or password doesn’t look right. Please try again."
        : error.code === "auth/too-many-requests"
        ? "Too many attempts. Please wait a moment before trying again."
        : error.code === "auth/invalid-email"
        ? "Please enter a valid email address."
        : "We couldn’t sign you in. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
const forgotPassword = async () => {
  errorMessage.value = "";
  if (!email.value.trim()) {
    errorMessage.value = "Enter your email address above to reset your password.";
    return;
  }
  isLoading.value = true;
  try {
    await sendPasswordResetEmail(auth, email.value.trim());
    store.addToast("Check your inbox for a password reset link.");
  } catch {
    errorMessage.value = "We couldn’t send the reset email. Check the address and try again.";
  } finally {
    isLoading.value = false;
  }
};
const googleSignIn = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
    goAfterAuth(user);
  } catch (error) {
    if (error.code !== "auth/popup-closed-by-user")
      errorMessage.value = "Google sign-in didn’t go through. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
onMounted(async () => {
  try {
    const data = await getTitles("/movie/top_rated", {}, controller.signal);
    posters.value = data.results.filter((movie) => movie.poster_path).slice(0, 3);
  } catch {
    /* The sign-in form remains available if artwork cannot load. */
  }
});
onUnmounted(() => controller.abort());
</script>
<template>
  <main id="main-content" class="container login-view" tabindex="-1">
    <section class="login-story" aria-label="Your movie collection">
      <p class="eyebrow">A PLACE FOR YOUR FAVORITES</p>
      <h2>Your taste.<br />Your collection.</h2>
      <p>Keep the films you love close.<br />And your next great watch even closer.</p>
      <div v-if="posters.length" class="login-gallery" aria-hidden="true">
        <img v-for="movie in posters" :key="movie.id" :src="imageUrl(movie.poster_path, 'w342')" alt="" />
      </div>
      <div v-else class="login-illustration" aria-hidden="true"><Icon name="bookmark" :size="80" /></div>
    </section>
    <section class="login-card">
      <RouterLink class="text-link back-to-explore" to="/browse"
        ><Icon name="left" :size="16" /> Back to exploring</RouterLink
      >
      <h1>{{ isLoginMode ? "Welcome back." : "Make it yours." }}</h1>
      <p class="login-subtitle">
        {{
          isLoginMode ? "Your next movie night is waiting." : "Start a collection of stories worth watching."
        }}
      </p>
      <div v-if="errorMessage" class="error-banner" role="alert">{{ errorMessage }}</div>
      <button class="button google-button" :disabled="isLoading" @click="googleSignIn">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.31 2.99-7.36Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.04.97-3.38.97-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.41 13.93A6 6 0 0 1 6.09 12c0-.67.12-1.32.32-1.93V7.48H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.52l3.34-2.59Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.95c1.48 0 2.81.51 3.86 1.52l2.89-2.89A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.48l3.34 2.59A5.99 5.99 0 0 1 12 5.95Z"
          /></svg
        >Continue with Google
      </button>
      <div class="auth-divider"><span>or use your email</span></div>
      <form class="auth-form" @submit.prevent="submit">
        <label for="auth-email">Email address</label
        ><input
          id="auth-email"
          v-model="email"
          class="field"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          required
          :disabled="isLoading"
        />
        <div class="password-label">
          <label for="auth-password">Password</label
          ><button
            v-if="isLoginMode"
            type="button"
            class="forgot-button"
            :disabled="isLoading"
            @click="forgotPassword"
          >
            Forgot password?
          </button>
        </div>
        <div class="password-field">
          <input
            id="auth-password"
            v-model="password"
            class="field"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="isLoginMode ? 'Enter your password' : 'At least 6 characters'"
            :autocomplete="isLoginMode ? 'current-password' : 'new-password'"
            required
            :disabled="isLoading"
          /><button
            type="button"
            :aria-pressed="showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? "Hide" : "Show" }}
          </button>
        </div>
        <template v-if="!isLoginMode"
          ><label for="auth-confirm">Confirm password</label
          ><input
            id="auth-confirm"
            v-model="confirmation"
            class="field"
            :type="showPassword ? 'text' : 'password'"
            placeholder="One more time"
            autocomplete="new-password"
            required
            :disabled="isLoading" /></template
        ><button class="button primary auth-submit" type="submit" :disabled="isLoading">
          {{ isLoading ? "One moment…" : isLoginMode ? "Sign in" : "Create account"
          }}<Icon v-if="!isLoading" name="arrow" :size="17" />
        </button>
      </form>
      <p class="toggle-mode">
        {{ isLoginMode ? "New around here?" : "Already have an account?" }}
        <button
          :disabled="isLoading"
          @click="
            isLoginMode = !isLoginMode;
            errorMessage = '';
            password = '';
            confirmation = '';
          "
        >
          {{ isLoginMode ? "Create an account" : "Sign in" }}
        </button>
      </p>
      <p class="auth-note">Just browsing? <RouterLink to="/browse">No account needed.</RouterLink></p>
    </section>
  </main>
</template>
<style scoped>
.login-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
  max-width: 1100px;
  min-height: calc(100dvh - var(--header-height));
  padding-block: 4rem;
}
.login-story h2 {
  font-size: clamp(2.5rem, 4vw, 4rem);
  line-height: 1.12;
  letter-spacing: -0.055em;
  margin-top: 1.2rem;
}
.login-story > p:not(.eyebrow) {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.8;
  margin-top: 1.3rem;
}
.login-gallery {
  display: flex;
  align-items: center;
  padding: 3rem 1rem 0;
  max-width: 380px;
}
.login-gallery img {
  width: 36%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 9px;
  border: 1px solid #ffffff26;
  box-shadow: 0 15px 45px #0006;
}
.login-gallery img:nth-child(1) {
  transform: rotate(-12deg) translateY(12px);
}
.login-gallery img:nth-child(2) {
  position: relative;
  z-index: 1;
}
.login-gallery img:nth-child(3) {
  transform: rotate(12deg) translateY(12px);
}
.login-illustration {
  padding: 4rem;
  color: var(--accent);
}
.login-card {
  width: 100%;
  max-width: 420px;
  margin-left: auto;
}
.back-to-explore {
  font-size: 0.7rem;
  margin-bottom: 1rem;
}
.login-card h1 {
  font-size: 2.1rem;
}
.login-subtitle {
  font-size: 0.84rem;
  color: var(--text-secondary);
  margin-top: 0.8rem;
  margin-bottom: 1.8rem;
}
.google-button {
  width: 100%;
  background: #edf0f7;
  color: #1b2230;
  min-height: 48px;
}
.google-button:hover:not(:disabled) {
  background: white;
}
.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-block: 1.6rem;
}
.auth-divider::before,
.auth-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}
.auth-form > label,
.password-label label {
  font-size: 0.75rem;
  color: #c1c9d8;
}
.auth-form > .field,
.password-field {
  margin-top: 0.5rem;
  margin-bottom: 1.2rem;
}
.auth-form .field {
  font-size: 0.8rem;
  min-height: 48px;
}
.password-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.forgot-button {
  font-size: 0.7rem;
  color: var(--accent);
  background: none;
  padding: 0.2rem 0;
  min-height: 32px;
}
.password-field {
  position: relative;
}
.password-field input {
  padding-right: 58px;
}
.password-field button {
  position: absolute;
  right: 4px;
  top: 2px;
  min-height: 44px;
  width: 50px;
  background: none;
  color: var(--text-muted);
  font-size: 0.67rem;
}
.auth-submit {
  width: 100%;
  margin-top: 0.3rem;
}
.toggle-mode {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-top: 1.5rem;
}
.toggle-mode button {
  background: none;
  color: var(--accent);
  font-weight: 550;
  min-height: 44px;
  font-size: inherit;
  padding-inline: 0.3rem;
}
.auth-note {
  text-align: center;
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 0.75rem;
}
.auth-note a {
  color: var(--text-secondary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.error-banner {
  background: #ff969e0a;
  border: 1px solid #ff969e44;
  color: var(--danger);
  padding: 0.85rem;
  margin-bottom: 1.2rem;
  font-size: 0.8rem;
  line-height: 1.6;
  border-radius: 8px;
}
@media (max-width: 850px) {
  .login-view {
    gap: 2.5rem;
  }
}
@media (max-width: 700px) {
  .login-view {
    display: block;
    padding-block: 1.5rem 3rem;
    min-height: 0;
  }
  .login-story {
    display: none;
  }
  .login-card {
    margin-inline: auto;
    max-width: 400px;
  }
  .login-card h1 {
    font-size: 2rem;
  }
  .forgot-button {
    min-height: 44px;
  }
}
</style>
