<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Modal from "../components/Modal.vue";
import UserMenu from "../components/UserMenu.vue";
import { useStore } from "../store";

const store = useStore();
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const router = useRouter();

const genres = [
  { id: "", name: "All" },
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10770, name: "TV Movie" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const genre = ref("");
const sortBy = ref("popularity.desc");
const search = ref("");
const movies = ref(null);
const page = ref(1);
const totalPages = ref(0);
const showModal = ref(false);
const selectedMovieId = ref(null);

const isLoading = ref(false);
const error = ref(null);

// Sort/genre params only apply to discover; search ignores them
const currentParams = computed(() => ({
  api_key: TMDB_API_KEY,
  region: "US",
  language: "en",
  include_adult: false,
  page: page.value,
  ...(search.value
    ? { query: search.value }
    : {
        sort_by: sortBy.value,
        ...(genre.value && { with_genres: genre.value }),
        // Vote-count floors keep obscure/unrated entries from dominating these sorts
        ...(sortBy.value === "vote_average.desc" && { "vote_count.gte": 200 }),
        ...(sortBy.value === "primary_release_date.desc" && {
          "primary_release_date.lte": new Date().toISOString().slice(0, 10),
          "vote_count.gte": 10,
        }),
      }),
}));

const getMovies = async () => {
  const endpoint = search.value ? "search/movie" : "discover/movie";
  error.value = null;
  isLoading.value = true;

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
      params: currentParams.value,
    });
    movies.value = response.data;
    // TMDB rejects requests beyond page 500
    totalPages.value = Math.min(response.data.total_pages, 500);
  } catch (err) {
    error.value = err.response?.data?.status_message || "Failed to load movies. Please try again.";
    movies.value = null;
  } finally {
    isLoading.value = false;
  }
};

let searchTimer;

const newSearch = () => {
  clearTimeout(searchTimer);
  page.value = 1;
  getMovies();
};

const queueSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(newSearch, 450);
};

// The search endpoint ignores genre/sort, so changing them exits search mode
const selectGenre = (id) => {
  genre.value = id;
  search.value = "";
  newSearch();
};

const onSortChange = () => {
  search.value = "";
  newSearch();
};

const navigate = (direction) => {
  page.value = Math.max(1, Math.min(page.value + direction, totalPages.value));
  getMovies();
};

const toggleModal = (id) => {
  selectedMovieId.value = id;
  showModal.value = !showModal.value;
};

// Initial load
onMounted(() => {
  getMovies();
});
</script>

<template>
  <main class="purchase-view">
    <header class="header">
      <div class="nav-bar">
        <h1 class="website-title">123A-Movies</h1>
        <div class="nav-actions">
          <button class="cart-button" @click="router.push('/cart')">
            Cart
            <span v-if="store.cartCount" class="cart-badge">{{ store.cartCount }}</span>
          </button>
          <UserMenu />
        </div>
      </div>
      <div class="toolbar">
        <div class="search-group">
          <input
            type="search"
            placeholder="Search movies..."
            v-model="search"
            @input="queueSearch"
            @keyup.enter="newSearch"
          />
          <button class="search-btn" @click="newSearch" :disabled="isLoading">
            {{ isLoading ? "..." : "Search" }}
          </button>
        </div>
        <div class="filter-group">
          <select v-model="sortBy" @change="onSortChange" aria-label="Sort by">
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="primary_release_date.desc">Newest</option>
          </select>
        </div>
        <div class="pagination">
          <button @click="navigate(-1)" :disabled="page === 1 || isLoading">&lsaquo;</button>
          <span>{{ page }} / {{ totalPages }}</span>
          <button @click="navigate(1)" :disabled="page >= totalPages || isLoading">&rsaquo;</button>
        </div>
      </div>
      <div class="genre-row">
        <button
          v-for="g in genres"
          :key="g.id"
          class="chip"
          :class="{ active: genre === g.id }"
          @click="selectGenre(g.id)"
        >
          {{ g.name }}
        </button>
      </div>
    </header>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="getMovies" class="retry-button">Try Again</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div v-for="n in 10" :key="n" class="loading-tile">
        <div class="loading-animation"></div>
      </div>
    </div>

    <!-- Movies Grid -->
    <div v-else-if="movies?.results?.length" class="tiles">
      <div
        v-for="movie in movies.results"
        :key="movie.id"
        class="tile"
        role="button"
        tabindex="0"
        :aria-label="movie.title"
        @click="toggleModal(movie.id)"
        @keydown.enter="toggleModal(movie.id)"
        @keydown.space.prevent="toggleModal(movie.id)"
      >
        <img
          v-if="movie.poster_path"
          :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
          :alt="movie.title"
          loading="lazy"
        />
        <div v-else class="poster-placeholder">
          <div class="poster-placeholder-content">
            <div class="movie-title">{{ movie.title }}</div>
            <div class="release-date" v-if="movie.release_date">
              {{ new Date(movie.release_date).getFullYear() }}
            </div>
          </div>
        </div>
        <span v-if="movie.vote_average" class="tile-rating">&#9733; {{ movie.vote_average.toFixed(1) }}</span>
        <div class="tile-overlay">
          <div class="tile-title">{{ movie.title }}</div>
          <div class="tile-year" v-if="movie.release_date">
            {{ new Date(movie.release_date).getFullYear() }}
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="movies && !movies.results?.length" class="no-results">
      No movies found. Try different search terms or filters.
    </div>

    <Modal v-if="showModal" :id="selectedMovieId" @toggleModal="toggleModal" />
  </main>
</template>

<style scoped>
.purchase-view {
  min-height: 100vh;
}

/* === Header === */
.header {
  background: rgba(13, 13, 31, 0.9);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 5;
  border-bottom: 1px solid var(--border);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
}

.website-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.nav-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.cart-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  transition: background-color 0.2s;
  background-color: rgba(255, 255, 255, 0.1);
  position: relative;
}

.cart-button:hover {
  background-color: rgba(255, 255, 255, 0.18);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--accent-strong);
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* === Toolbar === */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.5rem 0.75rem;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-group input {
  flex: 1;
  padding: 0.55rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-right: none;
  border-radius: 6px 0 0 6px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-size: 0.9rem;
}

.search-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.search-group input:focus {
  outline: none;
  border-color: var(--accent);
}

.search-btn {
  padding: 0.55rem 1rem;
  border-radius: 0 6px 6px 0;
  background: var(--accent-strong);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  transition: filter 0.2s;
}

.search-btn:hover:not(:disabled) {
  filter: brightness(1.15);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-group select {
  padding: 0.55rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--accent);
}

.filter-group select option {
  background: var(--bg-elevated);
  color: white;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.pagination span {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  min-width: 3.5rem;
  text-align: center;
}

.pagination button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.pagination button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* === Genre Chips === */
.genre-row {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem 0.75rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.genre-row::-webkit-scrollbar {
  display: none;
}

.chip {
  flex-shrink: 0;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.14);
  color: white;
}

.chip.active {
  background: var(--accent-strong);
  color: white;
}

/* === Movie Grid === */
.tiles {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.tile {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.tile:hover {
  transform: scale(1.04);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.tile img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
}

.tile-rating {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  color: #fbbf24;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
}

.tile-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.85rem;
  background: linear-gradient(180deg, transparent 55%, rgba(0, 0, 0, 0.85) 100%);
  opacity: 0;
  transition: opacity 0.2s;
}

.tile:hover .tile-overlay {
  opacity: 1;
}

.tile-title {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
}

.tile-year {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.poster-placeholder {
  aspect-ratio: 2/3;
  width: 100%;
  background: linear-gradient(135deg, #1e2a3a 0%, #16213e 100%);
  position: relative;
  overflow: hidden;
}

.poster-placeholder-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  text-align: center;
}

.movie-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.release-date {
  font-size: 0.8rem;
  opacity: 0.6;
}

/* === Loading === */
.loading-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.loading-tile {
  aspect-ratio: 2/3;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  overflow: hidden;
}

.loading-animation {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* === States === */
.error-message {
  margin: 2rem auto;
  padding: 1rem 1.5rem;
  background-color: rgba(255, 85, 85, 0.15);
  border: 1px solid rgba(255, 85, 85, 0.3);
  color: #ff8a8a;
  border-radius: 8px;
  text-align: center;
  max-width: 500px;
}

.retry-button {
  margin-left: 1rem;
  padding: 0.4rem 1rem;
  background-color: rgba(255, 85, 85, 0.2);
  color: #ff8a8a;
  border: 1px solid rgba(255, 85, 85, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: rgba(255, 85, 85, 0.3);
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.1rem;
}

/* === Responsive === */
@media screen and (max-width: 1200px) {
  .tiles,
  .loading-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 900px) {
  .tiles,
  .loading-container {
    grid-template-columns: repeat(3, 1fr);
  }

  .toolbar {
    padding: 0.5rem 1rem 0.75rem;
  }

  .search-group {
    max-width: none;
  }
}

@media screen and (max-width: 600px) {
  .tiles,
  .loading-container {
    grid-template-columns: repeat(2, 1fr);
    padding: 0.75rem;
  }

  .nav-bar {
    padding: 0.6rem 1rem;
  }

  .toolbar {
    padding: 0.5rem 1rem 0.6rem;
    gap: 0.5rem;
  }

  .genre-row {
    padding: 0 1rem 0.6rem;
  }

  .search-group {
    min-width: 0;
    flex-basis: 100%;
  }

  .filter-group {
    flex: 1;
  }

  .filter-group select {
    width: 100%;
  }
}
</style>
