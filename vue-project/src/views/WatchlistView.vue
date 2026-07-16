<script setup>
import { ref } from "vue";
import { useStore } from "../store/index.js";
import { useRouter } from "vue-router";
import UserMenu from "../components/UserMenu.vue";
import StarRating from "../components/StarRating.vue";

const router = useRouter();
const store = useStore();
const lastWatched = ref(null);

const formatYear = (date) => {
  if (!date) return "";
  return new Date(date).getFullYear();
};

const markWatched = async (index) => {
  const entry = await store.markWatched(index);
  if (entry) {
    lastWatched.value = entry;
    store.addToast(`Marked "${entry.title}" as watched`);
  }
};
</script>

<template>
  <div id="container">
    <div class="list-header">
      <div class="list-nav">
        <button class="back-button" @click="router.push('/purchase')">&larr; Back to Movies</button>
        <UserMenu />
      </div>
      <h1>
        My Watchlist <span v-if="store.watchlistCount">({{ store.watchlistCount }})</span>
      </h1>
    </div>

    <div v-if="lastWatched" class="rate-banner">
      <span class="rate-text">How was "{{ lastWatched.title }}"?</span>
      <StarRating :item="lastWatched" />
      <button class="banner-dismiss" @click="lastWatched = null" aria-label="Dismiss">&times;</button>
    </div>

    <div v-if="store.watchlist.length === 0" class="empty-list">
      <p>Your watchlist is empty.</p>
      <button class="browse-button" @click="router.push('/purchase')">Browse Movies</button>
    </div>

    <div v-else class="watchlist">
      <div v-for="(movie, index) in store.watchlist" :key="movie.id || index" class="movie-card">
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
            <span v-if="movie.media_type === 'tv'" class="tv-tag">TV</span>
            <span v-if="movie.release_date" class="movie-year">{{ formatYear(movie.release_date) }}</span>
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
            <span v-else-if="movie.seasons" class="meta-item">
              {{ movie.seasons }} {{ movie.seasons === 1 ? "season" : "seasons" }}
            </span>
          </div>

          <div class="card-actions">
            <button class="watched-button" @click="markWatched(index)">Watched it</button>
            <button class="delete-button" @click="store.removeFromWatchlist(index)">Remove</button>
          </div>
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

.list-header {
  margin-bottom: 2rem;
}

.list-header h1 {
  font-size: 2rem;
  margin-top: 1rem;
}

.list-header h1 span {
  color: rgba(255, 255, 255, 0.5);
  font-weight: normal;
}

.list-nav {
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

.rate-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--surface);
  border: 1px solid rgba(251, 191, 36, 0.35);
  border-radius: var(--radius);
  padding: 0.85rem 1.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.rate-text {
  flex: 1;
  min-width: 0;
}

.banner-dismiss {
  background: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.4rem;
  line-height: 1;
  padding: 0.2rem 0.4rem;
  transition: color 0.15s;
}

.banner-dismiss:hover {
  color: white;
}

.empty-list {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-list p {
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

.tv-tag {
  background-color: var(--accent-soft);
  color: var(--accent);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
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

.card-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: auto;
}

.watched-button {
  padding: 0.45rem 1rem;
  background-color: transparent;
  color: var(--success);
  border: 1px solid var(--success);
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.watched-button:hover {
  background-color: var(--success);
  color: #0d0d1f;
}

.delete-button {
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

  .movie-genres {
    justify-content: center;
  }

  .movie-overview {
    -webkit-line-clamp: 4;
  }

  .movie-meta {
    justify-content: center;
  }

  .card-actions {
    justify-content: center;
  }
}
</style>
