<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { useStore } from "../store";
import UserMenu from "../components/UserMenu.vue";
import { formatPrice } from "../pricing";

const router = useRouter();
const store = useStore();
const orders = ref(null);
const loadFailed = ref(false);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

onMounted(async () => {
  try {
    const snapshot = await getDoc(doc(firestore, "orders", store.user.email));
    orders.value = snapshot.exists() ? [...snapshot.data().orders].reverse() : [];
  } catch (e) {
    console.error("Failed to load orders:", e);
    loadFailed.value = true;
    orders.value = [];
  }
});
</script>

<template>
  <div id="container">
    <div class="orders-header">
      <div class="orders-nav">
        <button class="back-button" @click="router.push('/purchase')">&larr; Back to Movies</button>
        <UserMenu />
      </div>
      <h1>
        My Orders <span v-if="orders?.length">({{ orders.length }})</span>
      </h1>
    </div>

    <div v-if="orders === null" class="state-message">Loading your orders...</div>

    <div v-else-if="loadFailed" class="state-message">Couldn't load your orders. Please try again later.</div>

    <div v-else-if="orders.length === 0" class="state-message">
      <p>You haven't placed any orders yet.</p>
      <button class="browse-button" @click="router.push('/purchase')">Browse Movies</button>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-head">
          <span class="order-date">{{ formatDate(order.date) }}</span>
          <strong class="order-total">{{ formatPrice(order.total) }}</strong>
        </div>
        <div v-for="item in order.items" :key="item.id" class="order-item">
          <img v-if="item.poster" :src="`https://image.tmdb.org/t/p/w92/${item.poster}`" :alt="item.title" />
          <div v-else class="thumb-placeholder"></div>
          <span class="item-title">{{ item.title }}</span>
          <span class="item-price">{{ formatPrice(item.price) }}</span>
        </div>
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

.orders-header {
  margin-bottom: 2rem;
}

.orders-header h1 {
  font-size: 2rem;
  margin-top: 1rem;
}

.orders-header h1 span {
  color: rgba(255, 255, 255, 0.5);
  font-weight: normal;
}

.orders-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.state-message {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.5);
}

.state-message p {
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

.order-card {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.85rem;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid var(--border);
}

.order-date {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.95rem;
}

.order-total {
  color: var(--success);
  font-size: 1.15rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.4rem 0;
}

.order-item img,
.thumb-placeholder {
  width: 40px;
  aspect-ratio: 2/3;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.thumb-placeholder {
  background: linear-gradient(135deg, #34495e, #2c3e50);
}

.item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
}
</style>
