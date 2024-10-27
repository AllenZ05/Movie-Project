<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Modal from "../components/Modal.vue";
import { useStore } from "../store";

const store = useStore();
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const router = useRouter();

const genre = ref(28);
const search = ref("");
const movies = ref(null);
const page = ref(1);
const totalPages = ref(0);
const showModal = ref(false);
const selectedMovieId = ref(null);

// New states
const isLoading = ref(false);
const error = ref(null);

const currentParams = computed(() => ({
  api_key: TMDB_API_KEY,
  region: "US",
  language: "en",
  include_adult: true,
  page: page.value,
  ...(genre.value && { with_genres: genre.value }),
  ...(search.value && { query: search.value }),
}));

const getMovies = async () => {
  const endpoint = search.value ? "search/movie" : "discover/movie";
  error.value = null;
  isLoading.value = true;
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, { 
      params: currentParams.value 
    });
    movies.value = response.data;
    totalPages.value = response.data.total_pages;
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load movies. Please try again.";
    movies.value = null;
  } finally {
    isLoading.value = false;
  }
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
  <main>
    <header class="header">
      <h1 class="website-title">123A-Movies</h1>
      <div class="right-controls">
        <input 
          type="search" 
          placeholder="Enter search items" 
          v-model="search"
          @keyup.enter="getMovies"
        />
        <button 
          id="search-button" 
          @click="getMovies"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Searching...' : 'Search' }}
        </button>
        <select v-model="genre" @change="getMovies">
          <option value="28">Action</option>
          <option value="10751">Family</option>
          <option value="878">Science Fiction</option>
          <option value="12">Adventure</option>
          <option value="14">Fantasy</option>
          <option value="10770">TV Movie</option>
          <option value="16">Animation</option>
          <option value="36">History</option>
          <option value="53">Thriller</option>
          <option value="35">Comedy</option>
          <option value="27">Horror</option>
          <option value="10752">War</option>
          <option value="80">Crime</option>
          <option value="10402">Music</option>
          <option value="37">Western</option>
          <option value="99">Documentary</option>
          <option value="9648">Mystery</option>
          <option value="18">Drama</option>
          <option value="10749">Romance</option>
        </select>
        <button 
          class="get-button" 
          @click="getMovies"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Loading...' : 'Get' }}
        </button>
        <div class="pagination">
          <button 
            @click="navigate(-1)" 
            :disabled="page === 1 || isLoading"
          >
            Prev
          </button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button 
            @click="navigate(1)" 
            :disabled="page === totalPages || isLoading"
          >
            Next
          </button>
        </div>
        <button class="cart-button" @click="router.push('/cart')">Cart</button>
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
      <div v-for="movie in movies.results" :key="movie.id" class="tile">
        <img 
          v-if="movie.poster_path"
          :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
          @click="toggleModal(movie.id)"
          :alt="movie.title"
          loading="lazy"
        />
        <div 
          v-else 
          class="poster-placeholder"
          @click="toggleModal(movie.id)"
        >
          <div class="poster-placeholder-content">
            <div class="movie-title">{{ movie.title }}</div>
            <div class="release-date" v-if="movie.release_date">
              {{ new Date(movie.release_date).getFullYear() }}
            </div>
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
.header {
  background-color: #2c3e50;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.website-title {
  color: white;
  font-size: 2rem;
  text-align: left;
  margin-right: 2rem;
  margin-left: 1rem;
  flex-grow: 1;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 1rem;
  justify-items: center;
  padding: 0.5rem;
}

.right-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

input[type="search"],
select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

#search-button,
.get-button,
.cart-button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

#search-button,
.get-button {
  background-color: #3498db;
}

#search-button:hover,
.get-button:hover {
  background-color: #2980b9;
}

#search-button:disabled,
.get-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.cart-button {
  background-color: #4caf50;
}

.cart-button:hover {
  background-color: #66bb6a;
}

select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  margin-right: 0.5rem;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
}

.pagination button:hover {
  background-color: #2980b9;
}

.pagination button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.tile img {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.tile img:hover {
  transform: scale(1.05);
}

.poster-placeholder {
  aspect-ratio: 2/3;
  width: 100%;
  background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.poster-placeholder:hover {
  transform: scale(1.05);
}

.poster-placeholder-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  text-align: center;
  color: white;
}

.movie-title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  display: -moz-box;
  display: box;
  -webkit-line-clamp: 3;
  -moz-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.release-date {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Loading States */
.loading-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  padding: 0.5rem;
}

.loading-tile {
  aspect-ratio: 2/3;
  background: #2c3e50;
  border-radius: 10px;
  overflow: hidden;
}

.loading-animation {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    #2c3e50 0%,
    #34495e 50%,
    #2c3e50 100%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Error and No Results States */
.error-message {
  margin: 2rem auto;
  padding: 1rem;
  background-color: #ff5555;
  color: white;
  border-radius: 8px;
  text-align: center;
  max-width: 500px;
}

.retry-button {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background-color: white;
  color: #ff5555;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #f8f8f8;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: white;
  font-size: 1.2rem;
}

/* Media Queries */
@media screen and (max-width: 1200px) {
  .tiles, .loading-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 900px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .website-title {
    margin-bottom: 1rem;
    margin-left: 0;
  }

  .right-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .tiles, .loading-container {
    grid-template-columns: repeat(3, 1fr);
  }

  .pagination {
    margin-top: 1rem;
    justify-content: center;
  }
}

@media screen and (max-width: 600px) {
  .tiles, .loading-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .header {
    padding: 0.5rem;
  }

  input[type="search"],
  select,
  button {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .pagination {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>