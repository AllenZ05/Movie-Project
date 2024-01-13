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
        append_to_response: "credits,release_dates",
      },
    });
    movie.value = response.data;

    // Main Cast
    movie.value.mainCast =
      movie.value.credits.cast
        .slice(0, 5)
        .map((actor) => actor.name)
        .join(", ") || "Data not available";

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

    // Runtime
    movie.value.runtime = movie.value.runtime || "Data not available";

    // Rating
    movie.value.vote_average = movie.value.vote_average || "Data not available";
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
  }
});
</script>

<template>
  <Teleport to="body">
    <div id="ModalPage-outer-container" @click.self="$emit('toggleModal')">
      <div id="ModalPage-inner-container">
        <button @click="$emit('toggleModal')">X</button>
        <div v-if="movie" id="ModalPage-MovieInfo">
          <div id="ModalPage-img-container">
            <img id="ModalPage-img" :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`" />
          </div>
          <div id="ModalPage-MovieText">
            <h1>{{ movie.title }}</h1>
            <h2 v-if="formattedReleaseDate">{{ formattedReleaseDate }}</h2>
            <p v-if="genreNames"><strong>Genre:</strong> {{ genreNames }}</p>
            <p v-if="movie.mainCast"><strong>Main Cast:</strong> {{ movie.mainCast }}</p>
            <p v-if="movie.runtime"><strong>Runtime:</strong> {{ movie.runtime }} minutes</p>
            <p v-if="movie.vote_average"><strong>Rating:</strong> {{ movie.vote_average }}</p>
            <p><strong>Budget:</strong> {{ movie.formattedBudget }}</p>
            <p><strong>Revenue:</strong> {{ movie.formattedRevenue }}</p>
            <h3 id="BuyButton" @click="store.addToCart(movie.poster_path, movie.title)">Buy</h3>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
#ModalPage-outer-container {
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 5;
}

#ModalPage-inner-container {
  background-color: #404447;
  width: clamp(20rem, 100%, 60rem);
  position: relative;

  border: 0.5rem solid rgb(40, 35, 47);
}

#ModalPage-inner-container button {
  position: absolute;
  right: 0px;
  padding: 1rem;
  background: #31393f;
  font-weight: bold;
  font-size: 2rem;
}

#ModalPage-MovieInfo {
  display: flex;
  align-items: center;
  justify-content: center;
}

#ModalPage-img-container {
  width: 15rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#ModalPage-img {
  max-height: 100%;
  max-width: 100%;
}

#ModalPage-MovieText {
  font-size: 1rem;

  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

#ModalPage-MovieText > h1,
#ModalPage-MovieText > h2,
#ModalPage-MovieText > h3 {
  margin-bottom: 1rem;
}

#BuyButton {
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 1rem;
  background: #31393f;
  font-size: 1.2rem;
  width: 3rem;
  cursor: pointer;
  transition: 0.1s;
}

#BuyButton:hover {
  background-color: #92a8b2;
}
#BuyButton:active {
  background-color: #3c5059;
}
</style>
