<script setup>
import axios from "axios";
import { useStore } from "../store";
import { ref, onMounted, computed } from "vue";

const store = useStore();
const props = defineProps(["id"]);
const emit = defineEmits(["toggleModal"]);
const movie = ref(null);
const addedToCart = ref(false);
const isLoadingDetails = ref(true);

const genreNames = computed(() => movie.value?.genres?.map((genre) => genre.name).join(", ") || "");

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formattedReleaseDate = computed(() => formatDate(movie.value?.release_date));

const handleAddToCart = async () => {
  if (!movie.value) return;
  const m = movie.value;
  const added = await store.addToCart({
    id: m.id,
    title: m.title,
    poster: m.poster_path,
    overview: m.overview,
    release_date: m.release_date,
    vote_average: m.vote_average,
    runtime: m.runtime,
    genres: m.genres?.map((g) => g.name) || [],
  });
  addedToCart.value = true;
  if (!added) {
    addedToCart.value = "duplicate";
  }
};

onMounted(async () => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${props.id}`, {
      params: {
        api_key: import.meta.env.VITE_TMDB_API_KEY,
        region: "US",
        language: "en",
        include_adult: true,
        append_to_response: "credits,release_dates,videos",
      },
    });
    const data = response.data;

    data.mainCast =
      data.credits?.cast
        ?.slice(0, 5)
        .map((actor) => actor.name)
        .join(", ") || "Data not available";

    data.formattedBudget =
      data.budget > 1e6
        ? data.budget.toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
          })
        : "Data not available";

    data.formattedRevenue =
      data.revenue > 1e6
        ? data.revenue.toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
          })
        : "Data not available";

    const trailer = data.videos?.results.find((video) => video.site === "YouTube" && video.type === "Trailer");
    data.trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;

    movie.value = data;
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
  } finally {
    isLoadingDetails.value = false;
  }
});
</script>

<template>
  <Teleport to="body">
    <div id="outer-container" @click.self="emit('toggleModal')">
      <div id="inner-container">
        <button class="close-btn" @click="emit('toggleModal')" aria-label="Close"></button>

        <div v-if="isLoadingDetails" class="modal-loading">Loading movie details...</div>

        <div v-else-if="movie" id="MovieInfo">
          <div id="left-side">
            <h1>{{ movie.title }}</h1>
            <img
              v-if="movie.poster_path"
              id="page-img"
              :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
              :alt="`${movie.title} poster`"
            />
          </div>
          <div id="right-side">
            <h2 v-if="formattedReleaseDate">{{ formattedReleaseDate }}</h2>
            <p v-if="movie.overview"><strong>Overview:</strong> {{ movie.overview }}</p>
            <p v-if="genreNames"><strong>Genre:</strong> {{ genreNames }}</p>
            <p v-if="movie.mainCast"><strong>Main Cast:</strong> {{ movie.mainCast }}</p>
            <p v-if="movie.runtime"><strong>Runtime:</strong> {{ movie.runtime }} minutes</p>
            <p v-if="movie.vote_average"><strong>Rating:</strong> {{ movie.vote_average.toFixed(1) }} / 10</p>
            <p><strong>Budget:</strong> {{ movie.formattedBudget }}</p>
            <p><strong>Revenue:</strong> {{ movie.formattedRevenue }}</p>
            <div id="trailer-container">
              <div v-if="movie.trailerUrl" id="Trailer">
                <iframe
                  :src="movie.trailerUrl"
                  title="Movie Trailer"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
              <p v-else class="no-trailer">Trailer not available</p>
            </div>
            <button
              id="BuyButton"
              @click="handleAddToCart"
              :disabled="addedToCart !== false"
              :class="{ added: addedToCart === true, duplicate: addedToCart === 'duplicate' }"
            >
              {{ addedToCart === "duplicate" ? "Already in Cart" : addedToCart ? "Added to Cart!" : "Add to Cart" }}
            </button>
          </div>
        </div>

        <div v-else class="modal-loading">Failed to load movie details.</div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
#outer-container {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(7px);
  z-index: 10;
  animation: fadeInOverlay 0.25s ease-out;
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

#inner-container {
  position: relative;
  width: 80%;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 1;
  transition: background-color 0.2s;
}

.close-btn::before,
.close-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 2px;
  background-color: white;
  border-radius: 1px;
}

.close-btn::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.close-btn::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.close-btn:hover {
  background-color: rgba(255, 85, 85, 0.8);
}

.modal-loading {
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.1rem;
}

#MovieInfo {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

h1 {
  margin: 0.5rem 0;
  font-size: 2.5rem;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

#left-side {
  flex: 1;
  text-align: center;
}

#page-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

#right-side {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 2;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  text-align: left;
}

h2 {
  font-size: 1.3rem;
  margin: 0.5rem 0;
  opacity: 0.8;
}

#right-side > p {
  font-size: 1rem;
  margin: 0.5rem 0;
  line-height: 1.6;
}

.no-trailer {
  opacity: 0.5;
  font-style: italic;
}

#BuyButton {
  padding: 1rem 2rem;
  max-width: 15rem;
  margin-top: 1.5rem;
  background-color: #4caf50;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  transition:
    background-color 0.2s,
    transform 0.1s;
  align-self: center;
}

#BuyButton:hover:not(:disabled) {
  background-color: #45a049;
}

#BuyButton:active:not(:disabled) {
  transform: scale(0.95);
}

#BuyButton:disabled {
  cursor: default;
}

#BuyButton.added {
  background-color: #2196f3;
}

#BuyButton.duplicate {
  background-color: #666;
}

#trailer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
}

#Trailer {
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  height: 18rem;
  width: 25rem;
  max-width: 100%;
}

#Trailer iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

@media screen and (max-width: 1024px) {
  #MovieInfo {
    flex-direction: column;
  }

  #right-side {
    text-align: center;
  }

  h1 {
    font-size: 2rem;
  }
}

@media screen and (max-width: 575px) {
  #inner-container {
    padding: 1rem 0.5rem;
    width: 95%;
  }

  #right-side > p {
    font-size: 0.9rem;
  }

  #BuyButton {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }

  #Trailer {
    height: 12rem;
    width: 100%;
  }
}
</style>
