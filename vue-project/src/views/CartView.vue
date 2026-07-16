<script setup>
import { ref, computed } from "vue";
import { useStore } from "../store/index.js";
import { useRouter } from "vue-router";
import UserMenu from "../components/UserMenu.vue";
import { priceFor, formatPrice } from "../pricing";

const router = useRouter();
const store = useStore();
const isCheckingOut = ref(false);

const cartTotal = computed(() => store.cart.reduce((sum, movie) => sum + priceFor(movie.release_date), 0));

const formatYear = (date) => {
  if (!date) return "";
  return new Date(date).getFullYear();
};

const checkout = async () => {
  isCheckingOut.value = true;
  const order = await store.checkout();
  isCheckingOut.value = false;
  if (order) {
    store.addToast("Order placed!");
    router.push("/orders");
  }
};
</script>

<template>
  <div id="container">
    <div class="cart-header">
      <div class="cart-nav">
        <button class="back-button" @click="router.push('/purchase')">&larr; Back to Movies</button>
        <UserMenu />
      </div>
      <h1>
        Your Cart <span v-if="store.cartCount">({{ store.cartCount }})</span>
      </h1>
    </div>

    <div v-if="store.cart.length === 0" class="empty-cart">
      <p>Your cart is empty.</p>
      <button class="browse-button" @click="router.push('/purchase')">Browse Movies</button>
    </div>

    <div v-else class="cart-list">
      <div v-for="(movie, index) in store.cart" :key="movie.id || index" class="movie-card">
        <img
          v-if="movie.poster"
          :src="`https://image.tmdb.org/t/p/w500/${movie.poster}`"
          :alt="movie.title"
          class="movie-poster"
        />
        <div v-else class="poster-placeholder"></div>

        <div class="movie-info">
          <div class="movie-header">
            <h2>{{ movie.title }}</h2>
            <span v-if="movie.release_date" class="movie-year">{{ formatYear(movie.release_date) }}</span>
            <span class="movie-price">{{ formatPrice(priceFor(movie.release_date)) }}</span>
          </div>

          <div v-if="movie.genres?.length" class="movie-genres">
            <span v-for="genre in movie.genres" :key="genre" class="genre-tag">{{ genre }}</span>
          </div>

          <p v-if="movie.overview" class="movie-overview">{{ movie.overview }}</p>

          <div class="movie-meta">
            <span v-if="movie.vote_average" class="meta-item">
              <strong>{{ movie.vote_average.toFixed ? movie.vote_average.toFixed(1) : movie.vote_average }}</strong> / 10
            </span>
            <span v-if="movie.runtime" class="meta-item">{{ movie.runtime }} min</span>
          </div>

          <button class="delete-button" @click="store.removeFromCart(index)">Remove</button>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Total ({{ store.cartCount }} {{ store.cartCount === 1 ? "movie" : "movies" }})</span>
          <strong>{{ formatPrice(cartTotal) }}</strong>
        </div>
        <button class="checkout-button" @click="checkout" :disabled="isCheckingOut">
          {{ isCheckingOut ? "Placing order..." : "Checkout" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#container {
  min-height: 100vh;
  padding: 2rem 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.cart-header {
  margin-bottom: 2rem;
}

.cart-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header h1 {
  font-size: 2rem;
  margin-top: 1rem;
}

.cart-header h1 span {
  color: rgba(255, 255, 255, 0.5);
  font-weight: normal;
}

.back-button {
  padding: 0.6rem 1.2rem;
  background-color: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: var(--accent-soft);
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-cart p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.browse-button {
  padding: 0.85rem 2rem;
  background: var(--accent-strong);
  color: white;
  font-weight: 600;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition: filter 0.2s;
}

.browse-button:hover {
  filter: brightness(1.15);
}

.movie-card {
  display: flex;
  gap: 1.5rem;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: background-color 0.2s;
}

.movie-card:hover {
  background-color: var(--surface-hover);
}

.movie-poster {
  width: 140px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  object-fit: cover;
}

.poster-placeholder {
  width: 140px;
  aspect-ratio: 2/3;
  background: linear-gradient(135deg, #34495e, #2c3e50);
  border-radius: 8px;
  flex-shrink: 0;
}

.movie-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
}

.movie-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.movie-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
}

.movie-year {
  color: rgba(255, 255, 255, 0.4);
  font-size: 1rem;
}

.movie-price {
  margin-left: auto;
  color: var(--success);
  font-size: 1.05rem;
  font-weight: 600;
}

.movie-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.genre-tag {
  background-color: var(--accent-soft);
  color: var(--accent);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.movie-overview {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-meta {
  display: flex;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.meta-item strong {
  color: rgba(255, 255, 255, 0.8);
}

.delete-button {
  align-self: flex-start;
  margin-top: auto;
  padding: 0.45rem 1rem;
  background-color: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.delete-button:hover {
  background-color: #ff6b6b;
  color: white;
}

.cart-summary {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.05rem;
}

.summary-row span {
  color: rgba(255, 255, 255, 0.65);
}

.summary-row strong {
  font-size: 1.3rem;
  color: var(--success);
}

.checkout-button {
  padding: 0.85rem;
  background: var(--accent-strong);
  color: white;
  font-weight: 600;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition: filter 0.2s;
}

.checkout-button:hover:not(:disabled) {
  filter: brightness(1.15);
}

.checkout-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media screen and (max-width: 600px) {
  .movie-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .movie-poster {
    width: 180px;
  }

  .movie-header {
    justify-content: center;
  }

  .movie-price {
    margin-left: 0;
  }

  .movie-genres {
    justify-content: center;
  }

  .movie-overview {
    -webkit-line-clamp: 4;
  }

  .movie-meta {
    justify-content: center;
  }

  .delete-button {
    align-self: center;
  }
}
</style>
