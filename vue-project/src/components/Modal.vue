<script setup>
import axios from "axios";
import { useStore } from "../store";
import { ref, onMounted, computed } from "vue";

const store = useStore();
const props = defineProps(["id"]);
const movie = ref(null);

const genreNames = computed(() => movie.value?.genres?.map((genre) => genre.name).join(", ") || "");

const formatDate = (date) => {
  if (!date) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
};

const formattedReleaseDate = computed(() => {
  return formatDate(movie.value?.release_date);
});

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
    movie.value = response.data;

    // Overview
    movie.overview = movie.value.overview || "Data not available";

    // Main Cast
    movie.value.mainCast =
      movie.value.credits.cast
        .slice(0, 5)
        .map((actor) => actor.name)
        .join(", ") || "Data not available";

    // Runtime
    movie.value.runtime = movie.value.runtime || "Data not available";

    // Rating
    movie.value.vote_average = movie.value.vote_average || "Data not available";

    // Budget
    movie.value.formattedBudget =
      movie.value.budget > 1e6
        ? movie.value.budget.toLocaleString(undefined, { style: "currency", currency: "USD" })
        : "Data not available";

    // Revenue
    movie.value.formattedRevenue =
      movie.value.revenue > 1e6
        ? movie.value.revenue.toLocaleString(undefined, { style: "currency", currency: "USD" })
        : "Data not available";

    // Trailer
    const trailer = movie.value.videos?.results.find((video) => video.site === "YouTube" && video.type === "Trailer");
    movie.value.trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
  }
});
</script>

<template>
  <Teleport to="body">
    <div id="outer-container" @click.self="$emit('toggleModal')">
      <div id="inner-container">
        <button @click="$emit('toggleModal')">X</button>
        <div v-if="movie" id="MovieInfo">
          <div id="left-side">
            <h1>{{ movie.title }}</h1>
            <img id="page-img" :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`" alt="Movie poster" />
          </div>
          <div id="right-side">
            <h2 v-if="formattedReleaseDate">{{ formattedReleaseDate }}</h2>
            <p v-if="movie.overview"><strong>Overview:</strong> {{ movie.overview }}</p>
            <p v-if="genreNames"><strong>Genre:</strong> {{ genreNames }}</p>
            <p v-if="movie.mainCast"><strong>Main Cast:</strong> {{ movie.mainCast }}</p>
            <p v-if="movie.runtime"><strong>Runtime:</strong> {{ movie.runtime }} minutes</p>
            <p v-if="movie.vote_average"><strong>Rating:</strong> {{ movie.vote_average }}</p>
            <p><strong>Budget:</strong> {{ movie.formattedBudget }}</p>
            <p><strong>Revenue:</strong> {{ movie.formattedRevenue }}</p>
            <div v-if="movie.trailerUrl" id="Trailer">
              <iframe
                :src="movie.trailerUrl"
                title="Movie Trailer"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              >
              </iframe>
            </div>
            <p v-else>Trailer not available</p>
            <h3 id="BuyButton" @click="store.addToCart(movie.poster_path, movie.title)">Buy</h3>
          </div>
        </div>
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
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10;
}

#inner-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #2c2f33;
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  overflow: auto;
  max-height: 70vh;
  max-width: 70vw;
  width: auto;
  margin: 2rem;
  padding: 2rem;
  animation: fadeInModal 0.3s ease-out forwards;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: blue gray;
}

#inner-container button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background-color: #ff5555;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  cursor: pointer;
}

#inner-container button:hover {
  background-color: #ff4444;
}

#MovieInfo {
  display: flex;
  justify-content: center;
  align-items: center;
}

h1 {
  margin: 0.5rem 0;
  font-size: 3rem;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

#left-side,
#right-side {
  flex: 1;
  max-width: 50%;
}

#left-side {
  grid-column: 1;
}

#page-img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

#right-side {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 2;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  padding: 1rem;
  text-align: left;
  grid-column: 2;
}

h2 {
  margin: 0.5rem 0;
}

#right-side > p {
  font-size: 1rem;
  margin: 0.25rem 0;
  line-height: 1.5;
}

#BuyButton {
  padding: 1rem 2rem;
  width: auto;
  max-width: 15rem;
  margin-top: auto;
  margin-bottom: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  align-self: center;
  text-align: center;
  justify-content: center;
}

#BuyButton:hover {
  background-color: #45a049;
}

#BuyButton:active {
  transform: scale(0.95);
}

#Trailer {
  position: relative;
  overflow: hidden;
  margin: 1rem 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  width: 30rem;
  height: 20rem;
}

#Trailer iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

@keyframes fadeInModal {
  from {
    transform: translateY(-20vh);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Media Queries */

@media screen and (min-width: 1200px) {
  #inner-container {
    flex-direction: row;
    padding: 2rem;
  }

  #MovieInfo {
    align-items: flex-start;
  }
}

@media screen and (min-width: 768px) and (max-width: 1199px) {
  #inner-container {
    flex-direction: column;
    padding: 1.5rem;
  }

  #left-side,
  #right-side {
    width: 100%;
    padding: 0.5rem;
  }

  #BuyButton {
    padding: 1rem;
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  #MovieInfo {
    flex-direction: column;
  }
}

@media screen and (min-width: 576px) and (max-width: 767px) {
  #inner-container {
    padding: 1rem;
  }

  #right-side {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  #BuyButton {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
}

@media screen and (max-width: 575px) {
  #inner-container {
    padding: 0.5rem;
    max-height: 90vh;
    max-width: 90vw;
  }

  #right-side {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  #BuyButton {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}

@media screen and (max-height: 500px) {
  #inner-container {
    flex-direction: column;
  }

  #MovieInfo {
    flex-direction: column;
  }
}
</style>
