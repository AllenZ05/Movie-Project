<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Hero from "../components/Hero.vue";
import MovieCard from "../components/MovieCard.vue";
import Footer from "../components/Footer.vue";
import Icon from "../components/Icon.vue";
import { getTitles, isCancelled } from "../lib/tmdb";
import { discoveryParams } from "../lib/discovery";
const trending = ref([]);
const topRated = ref([]);
const loading = ref(true);
const error = ref(false);
let controller;
const featured = computed(() => trending.value.find((movie) => movie.backdrop_path));
const load = async () => {
  controller?.abort();
  controller = new AbortController();
  loading.value = true;
  error.value = false;
  const signal = controller.signal;
  const results = await Promise.allSettled([
    getTitles("/trending/movie/week", {}, signal),
    getTitles("/discover/movie", { region: "US", ...discoveryParams({ sort: "vote_average.desc" }) }, signal),
  ]);
  if (signal.aborted) return;
  trending.value =
    results[0].status === "fulfilled"
      ? results[0].value.results.filter((item) => !item.adult).slice(0, 6)
      : [];
  topRated.value =
    results[1].status === "fulfilled"
      ? results[1].value.results.filter((item) => !item.adult).slice(0, 6)
      : [];
  error.value = results.some((result) => result.status === "rejected" && !isCancelled(result.reason));
  loading.value = false;
};
onMounted(load);
onUnmounted(() => controller?.abort());
</script>
<template>
  <main id="main-content" tabindex="-1">
    <Hero :featured="featured" />
    <div class="container discovery-sections">
      <div v-if="error" class="error-state" role="alert">
        Some titles couldn’t be loaded.<button class="button quiet" @click="load">Try again</button>
      </div>
      <section v-if="loading || trending.length" class="discovery-section" aria-labelledby="trending-heading">
        <div class="section-heading">
          <div>
            <h2 id="trending-heading">Trending this week<span class="heading-dot"></span></h2>
            <p>The stories everyone’s getting into.</p>
          </div>
          <RouterLink class="text-link" to="/browse?collection=trending"
            >View all <Icon name="arrow" :size="16"
          /></RouterLink>
        </div>
        <div v-if="loading" class="movie-rail" aria-label="Loading trending movies" aria-busy="true">
          <div v-for="n in 6" :key="n">
            <div class="skeleton-poster"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>
        <div v-else class="movie-rail">
          <MovieCard v-for="movie in trending" :key="movie.id" :movie="movie" />
        </div>
      </section>
      <section class="library-callout">
        <div class="callout-art" aria-hidden="true">
          <Icon name="bookmark" :size="30" /><span class="callout-star">✦</span>
        </div>
        <div>
          <p class="eyebrow">YOUR NEXT MOVIE NIGHT, SORTED</p>
          <h2>Good finds deserve a watchlist.</h2>
          <p>Save what catches your eye. Come back when the mood strikes.</p>
        </div>
        <RouterLink class="text-link" to="/watchlist"
          >Your watchlist <Icon name="arrow" :size="17"
        /></RouterLink>
      </section>
      <section v-if="loading || topRated.length" class="discovery-section" aria-labelledby="rated-heading">
        <div class="section-heading">
          <div>
            <h2 id="rated-heading">Audience favorites</h2>
            <p>Highest TMDB scores, with at least 1,000 ratings.</p>
          </div>
          <RouterLink class="text-link" to="/browse?sort=vote_average.desc"
            >View all <Icon name="arrow" :size="16"
          /></RouterLink>
        </div>
        <div v-if="loading" class="movie-rail" aria-label="Loading top rated movies" aria-busy="true">
          <div v-for="n in 6" :key="n">
            <div class="skeleton-poster"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>
        <div v-else class="movie-rail">
          <MovieCard v-for="movie in topRated" :key="movie.id" :movie="movie" />
        </div>
      </section>
    </div>
  </main>
  <Footer />
</template>
<style scoped>
.discovery-sections {
  position: relative;
  margin-top: 0.3rem;
}
.discovery-section {
  padding-block: 1.5rem;
}
.heading-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #92bcff;
  vertical-align: middle;
  margin-left: 0.65rem;
}
.library-callout {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.75rem 2rem;
  margin-block: 2.5rem;
  background: linear-gradient(105deg, #161f32, #141922 65%);
  border: 1px solid #ffffff0c;
  border-radius: 12px;
}
.callout-art {
  position: relative;
  display: grid;
  place-items: center;
  width: 65px;
  height: 65px;
  flex-shrink: 0;
  border: 1px solid #9cbdff26;
  border-radius: 14px;
  transform: rotate(-8deg);
  color: #a6c2f5;
  background: #9cbdff09;
}
.callout-star {
  position: absolute;
  right: -8px;
  top: -11px;
  color: #becbdf;
  font-size: 24px;
}
.library-callout h2 {
  font-size: 1.2rem;
  margin-block: 0.5rem;
}
.library-callout p:not(.eyebrow) {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.library-callout .eyebrow {
  font-size: 0.57rem;
}
.library-callout > .text-link {
  margin-left: auto;
  white-space: nowrap;
  color: #c4d6fa;
}
@media (max-width: 700px) {
  .discovery-section {
    padding-block: 1.5rem;
  }
  .library-callout {
    padding: 1.4rem;
    gap: 1rem;
    flex-wrap: wrap;
    margin-block: 1.5rem;
  }
  .callout-art {
    display: none;
  }
  .library-callout h2 {
    font-size: 1.1rem;
  }
  .library-callout p {
    line-height: 1.6;
  }
  .library-callout > .text-link {
    margin-left: 0;
    min-height: 32px;
  }
}
</style>
