<script setup>
import axios from "axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import Modal from "../components/Modal.vue";

const router = useRouter();
const genre = ref(28);
const search = ref("");
const movies = ref(null);
const page = ref(1);
const currentURL = ref("");
const totalPages = ref(0);
const showModal = ref(false);
const selectedRecordId = ref(0);

const toggleModal = (id) => {
  showModal.value = !showModal.value;
  selectedRecordId.value = id;
};

const getTMDBData = async (url, options, page) => {
  movies.value = (
    await axios.get(url, {
      params: {
        api_key: import.meta.env.VITE_TMDB_API_KEY,
        region: "US",
        language: "en",
        include_adult: false,
        page,
        ...options,
      },
    })
  ).data;
  totalPages.value = movies.value.total_pages;
  currentURL.value = url;
};
</script>

<template>
  <main>
    <header>
      <div class="controls">
        <div>
          <input type="search" placeholder="Enter search items" v-model="search" />
          <button
            id="search-button"
            @click="
              getTMDBData('https://api.themoviedb.org/3/search/movie', {
                query: search,
              })
            "
          >
            Search
          </button>
        </div>
        <div>
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
          <button
            @click="
              getTMDBData('https://api.themoviedb.org/3/discover/movie', {
                with_genres: genre,
              })
            "
          >
            Get
          </button>
          <button @click="router.push('/cart')">Cart</button>
        </div>
      </div>
      <div class="pagination">
        <button
          @click="
            getTMDBData(
              currentURL,
              {
                query: search,
                with_genres: genre,
              },
              page === 1 ? 1 : page--
            )
          "
        >
          Prev
        </button>
        <p>{{ `Page ${page} of ${totalPages}` }}</p>
        <button
          @click="
            getTMDBData(
              currentURL,
              {
                query: search,
                with_genres: genre,
              },
              page >= totalPages ? totalPages : page++
            )
          "
        >
          Next
        </button>
      </div>
    </header>
    <div v-if="movies" class="tiles">
      <div v-for="movie in movies.results" :key="movie.id" class="tile">
        <img
          :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
          @click="toggleModal(movie.id)"
        />
      </div>
    </div>
  </main>
  <Modal v-if="showModal" :id="selectedRecordId" @toggleModal="toggleModal()" />
</template>

<style scoped>
header {
  background-color: rgb(144, 144, 168);
  height: 12vh;
}
.controls {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  gap: 1rem;
}

#search-button {
  padding: 0.5rem 1rem;
  border-radius: 0.3rem;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  margin-left: 0.5rem;
  cursor: pointer;
}

#search-button:hover {
  background-color: #0056b3;
}

.pagination button {
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  background-color: #007bff;
  color: white;
  font-size: 0.7rem;
  cursor: pointer;
}

.pagination button:hover {
  background-color: #0056b3;
}

.controls button {
  padding: 0.3rem 0.6rem;
  margin-left: 0.5rem;
  border-radius: 0.3rem;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.controls button:hover {
  background-color: #0056b3;
}
.tiles {
  display: grid;
  grid-template: repeat(4, 1fr) / repeat(5, 1fr);
  justify-items: center;
  grid-gap: 1rem;

  background-color: gray;
  padding: 0.5rem;
}

img {
  width: 12.5rem;
}
</style>
