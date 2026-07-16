<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store";
import UserMenu from "../components/UserMenu.vue";
import StarRating from "../components/StarRating.vue";

const router = useRouter();
const store = useStore();

const watched = computed(() => [...store.watchHistory].reverse());

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
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

    <div v-if="watched.length === 0" class="state-message">
      <p>You haven't marked any movies as watched yet.</p>
      <button class="browse-button" @click="router.push('/purchase')">Browse Movies</button>
    </div>

    <div v-else class="history-list">
      <div v-for="movie in watched" :key="movie.id + movie.watchedAt" class="history-item">
        <img v-if="movie.poster" :src="`https://image.tmdb.org/t/p/w92/${movie.poster}`" :alt="movie.title" />
        <div v-else class="thumb-placeholder"></div>
        <div class="item-info">
          <span class="item-title">
            {{ movie.title }}
            <span v-if="movie.media_type === 'tv'" class="tv-tag">TV</span>
          </span>
          <span class="item-date">Watched {{ formatDate(movie.watchedAt) }}</span>
        </div>
        <div class="item-actions">
          <StarRating :item="movie" />
          <button class="delete-button" @click="store.removeFromHistory(movie)">Remove</button>
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
  flex: 1;
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

.tv-tag {
  background-color: var(--accent-soft);
  color: var(--accent);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  vertical-align: middle;
  margin-left: 0.3rem;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.delete-button {
  padding: 0.4rem 0.85rem;
  background-color: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 6px;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.delete-button:hover {
  background-color: #ff6b6b;
  color: white;
}

@media screen and (max-width: 600px) {
  .history-item {
    flex-wrap: wrap;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
