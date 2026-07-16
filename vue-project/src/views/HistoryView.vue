<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { useStore } from "../store";
import UserMenu from "../components/UserMenu.vue";

const router = useRouter();
const store = useStore();
const watched = ref(null);
const loadFailed = ref(false);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

onMounted(async () => {
  try {
    const snapshot = await getDoc(doc(firestore, "watchHistory", store.user.email));
    watched.value = snapshot.exists() ? [...snapshot.data().watched].reverse() : [];
  } catch (e) {
    console.error("Failed to load watch history:", e);
    loadFailed.value = true;
    watched.value = [];
  }
});
</script>

<template>
  <div id="container">
    <div class="history-header">
      <div class="history-nav">
        <button class="back-button" @click="router.push('/purchase')">&larr; Back to Movies</button>
        <UserMenu />
      </div>
      <h1>
        Watch History <span v-if="watched?.length">({{ watched.length }})</span>
      </h1>
    </div>

    <div v-if="watched === null" class="state-message">Loading your watch history...</div>

    <div v-else-if="loadFailed" class="state-message">Couldn't load your watch history. Please try again later.</div>

    <div v-else-if="watched.length === 0" class="state-message">
      <p>You haven't marked any movies as watched yet.</p>
      <button class="browse-button" @click="router.push('/purchase')">Browse Movies</button>
    </div>

    <div v-else class="history-list">
      <div v-for="movie in watched" :key="movie.id + movie.watchedAt" class="history-item">
        <img v-if="movie.poster" :src="`https://image.tmdb.org/t/p/w92/${movie.poster}`" :alt="movie.title" />
        <div v-else class="thumb-placeholder"></div>
        <div class="item-info">
          <span class="item-title">{{ movie.title }}</span>
          <span class="item-date">Watched {{ formatDate(movie.watchedAt) }}</span>
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

.history-header {
  margin-bottom: 2rem;
}

.history-header h1 {
  font-size: 2rem;
  margin-top: 1rem;
}

.history-header h1 span {
  color: rgba(255, 255, 255, 0.5);
  font-weight: normal;
}

.history-nav {
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

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.85rem 1.25rem;
  margin-bottom: 0.75rem;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: var(--surface-hover);
}

.history-item img,
.thumb-placeholder {
  width: 48px;
  aspect-ratio: 2/3;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.thumb-placeholder {
  background: linear-gradient(135deg, #34495e, #2c3e50);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.item-title {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}
</style>
