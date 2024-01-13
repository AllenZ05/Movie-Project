<script setup>
import axios from "axios";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Modal from "../components/Modal.vue";

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
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, { params: currentParams.value });
    movies.value = response.data;
    totalPages.value = response.data.total_pages;
  } catch (error) {
    console.error(error);
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
</script>

<template>
  <main>
    <header class="header">
      <h1 class="website-title">123A-Movies</h1>
      <div class="right-controls">
        <input type="search" placeholder="Enter search items" v-model="search" />
        <button id="search-button" @click="getMovies">Search</button>
        <select v-model="genre">
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
        <button class="get-button" @click="getMovies">Get</button>
        <div class="pagination">
          <button @click="navigate(-1)">Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button @click="navigate(1)">Next</button>
        </div>
        <button class="cart-button" @click="router.push('/cart')">Cart</button>
      </div>
    </header>
    <div v-if="movies" class="tiles">
      <div v-for="movie in movies.results" :key="movie.id" class="tile">
        <img :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`" @click="toggleModal(movie.id)" />
      </div>
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

input[type="search"], select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

#search-button, .get-button, .cart-button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #3498db;
  color: white;
  cursor: pointer;
}

#search-button:hover, .get-button:hover, .cart-button:hover {
  background-color: #2980b9;
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

img {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover, img:hover {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

/* Media queries  */

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch; 
  }

  .website-title {
    margin-bottom: 1rem;
    margin-left: 0; 
  }

  .right-controls,
  .pagination {
    flex-direction: column;
    align-items: center;
  }

  .pagination {
    margin-top: 1rem;
  }

  input[type="search"],
  select,
  button {
    width: 100%; 
    margin-bottom: 0.5rem; 
  }
}

@media (max-width: 1200px) {
  .tiles {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .tiles {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;
    text-align: center;
  }

  .website-title {
    order: -1;
    margin-bottom: 0.5rem;
  }

  .right-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .right-controls > * {
    margin-bottom: 0.5rem;
  }

  .pagination {
    flex-wrap: wrap; 
    justify-content: center; 
  }
}
</style>
