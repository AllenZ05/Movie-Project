<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import MovieCard from "../components/MovieCard.vue";
import Footer from "../components/Footer.vue";
import Icon from "../components/Icon.vue";
import AppSelect from "../components/AppSelect.vue";
import { getTitles, isCancelled } from "../lib/tmdb";
import {
  movieGenres,
  tvGenres,
  discoveryParams,
  discoverySortOptions,
  minimumVotesOptions,
  minimumVotesFor,
} from "../lib/discovery";
const route = useRoute();
const router = useRouter();
const mediaType = computed(() => (route.query.media === "tv" ? "tv" : "movie"));
const genres = computed(() => (mediaType.value === "tv" ? tvGenres : movieGenres));
const genre = computed(() =>
  genres.value.some((item) => String(item.id) === route.query.genre) ? route.query.genre : ""
);
const sortBy = computed(() =>
  discoverySortOptions.some((option) => option.value === route.query.sort)
    ? route.query.sort
    : route.query.collection === "top_rated"
    ? "vote_average.desc"
    : "popularity.desc"
);
const votes = computed(() =>
  minimumVotesOptions.some((option) => option.value === route.query.votes) ? route.query.votes : "auto"
);
const minimumVotes = computed(() => minimumVotesFor(sortBy.value, votes.value, era.value));
const eras = [
  { value: "", label: "Any time" },
  { value: "now_playing", label: "Now playing / airing" },
  { value: "upcoming", label: "Coming soon" },
  { value: "this_year", label: "This year" },
  { value: "last_5", label: "Last 5 years" },
  ...["2020s", "2010s", "2000s", "1990s", "1980s"].map((value) => ({ value, label: value })),
  { value: "older", label: "Before 1980" },
];
const era = computed(() => (eras.some((item) => item.value === route.query.era) ? route.query.era : ""));
const collection = computed(() =>
  ["trending", "top_rated"].includes(route.query.collection) ? route.query.collection : ""
);
const query = computed(() => (typeof route.query.q === "string" ? route.query.q.trim() : ""));
const search = ref(query.value);
const page = computed(() => Math.min(500, Math.max(1, Math.floor(Number(route.query.page)) || 1)));
const movies = ref([]);
const totalPages = ref(1);
const totalResults = ref(0);
const loading = ref(true);
const error = ref(false);
const filtersOpen = ref(false);
const resultsHeading = ref(null);
const filterCount = computed(
  () => Number(!!genre.value) + Number(!!era.value) + Number(votes.value !== "auto")
);
const showingCollection = computed(
  () => collection.value === "trending" && !filterCount.value && sortBy.value === "popularity.desc"
);
const sortOptions = computed(() => [
  ...(showingCollection.value
    ? [
        {
          value: collection.value,
          label: "Trending this week",
        },
      ]
    : []),
  ...discoverySortOptions,
]);
const genreOptions = computed(() =>
  genres.value.map((g) => ({ value: String(g.id), label: g.id ? g.name : "All genres" }))
);
const heading = computed(() =>
  query.value
    ? `Results for “${query.value}”`
    : showingCollection.value && collection.value === "trending"
    ? "Trending this week."
    : sortBy.value === "vote_average.desc"
    ? "The audience favorites."
    : sortBy.value === "vote_count.desc"
    ? "The most rated. Ever."
    : "Find your next favorite."
);
const rankingNote = computed(() => {
  if (query.value) return "Search matches ordered by relevance. Scores and rating counts come from TMDB.";
  if (showingCollection.value) return "Trending on TMDB over the past week.";
  const descriptions = {
    "popularity.desc": "TMDB popularity: recent activity, release timing, and total votes.",
    "vote_count.desc":
      "Most TMDB ratings across all years, within your filters. More ratings means more participation, not a higher score.",
    "vote_average.desc": "Highest TMDB audience scores.",
    "vote_average.asc": "Lowest TMDB audience scores.",
    "primary_release_date.desc": "Newest release dates first.",
    "primary_release_date.asc": "Oldest release dates first.",
  };
  return `${descriptions[sortBy.value]} ${
    minimumVotes.value
      ? `At least ${minimumVotes.value.toLocaleString()} ratings per title.`
      : "No minimum rating count."
  }`;
});
let controller;
let searchTimer;
let version = 0;

const updateQuery = (updates, replace = false) => {
  clearTimeout(searchTimer);
  const next = { ...route.query, ...updates };
  for (const key of Object.keys(next)) if (next[key] === "" || next[key] == null) delete next[key];
  if (router.resolve({ query: next }).fullPath === route.fullPath) {
    search.value = query.value;
    return load();
  }
  return router[replace ? "replace" : "push"]({ query: next });
};
const load = async () => {
  controller?.abort();
  controller = new AbortController();
  const requestVersion = ++version;
  loading.value = true;
  error.value = false;
  const type = mediaType.value;
  let endpoint = `/discover/${type}`;
  let params = { page: page.value, region: "US" };
  if (query.value) {
    endpoint = `/search/${type}`;
    params.query = query.value;
  } else if (showingCollection.value) {
    endpoint = `/trending/${type}/week`;
  } else {
    params = {
      ...params,
      ...discoveryParams({
        mediaType: type,
        sort: sortBy.value,
        genre: genre.value,
        era: era.value,
        votes: votes.value,
      }),
    };
  }
  try {
    const data = await getTitles(endpoint, params, controller.signal);
    if (version !== requestVersion) return;
    movies.value = data.results.filter((item) => !item.adult);
    totalPages.value = Math.min(500, Math.max(1, data.total_pages));
    totalResults.value = data.total_results;
  } catch (err) {
    if (version === requestVersion && !isCancelled(err)) {
      error.value = true;
      movies.value = [];
    }
  } finally {
    if (version === requestVersion) loading.value = false;
  }
};
const submitSearch = async () => {
  clearTimeout(searchTimer);
  const term = search.value.trim();
  if (term === query.value && page.value === 1) return load();
  await updateQuery({ q: term, page: null }, true);
};
const queueSearch = () => {
  clearTimeout(searchTimer);
  controller?.abort();
  version++;
  loading.value = true;
  error.value = false;
  searchTimer = setTimeout(submitSearch, 300);
};
const setMediaType = (type) => {
  search.value = "";
  updateQuery({ media: type === "movie" ? null : type, genre: null, page: null, q: null });
};
const setFilter = (name, value) =>
  updateQuery({ sort: sortBy.value, [name]: value, page: null, collection: null });
const reset = () => {
  search.value = "";
  updateQuery({ q: null, genre: null, era: null, sort: null, votes: null, collection: null, page: null });
};
const navigate = async (direction) => {
  await updateQuery({ page: Math.min(totalPages.value, Math.max(1, page.value + direction)) });
  await nextTick();
  resultsHeading.value?.scrollIntoView({ block: "start" });
};
watch(
  () =>
    JSON.stringify([
      mediaType.value,
      genre.value,
      sortBy.value,
      era.value,
      votes.value,
      collection.value,
      query.value,
      page.value,
    ]),
  () => {
    clearTimeout(searchTimer);
    search.value = query.value;
    load();
  },
  { immediate: true }
);
onUnmounted(() => {
  clearTimeout(searchTimer);
  controller?.abort();
  version++;
});
</script>
<template>
  <main id="main-content" class="container browse-view" tabindex="-1">
    <div class="browse-intro">
      <p class="eyebrow">THE NEXT STORY STARTS HERE</p>
      <h1>{{ heading }}</h1>
      <p class="muted">Explore a whole world of movies and TV.</p>
    </div>
    <div class="browse-controls">
      <form class="search-form" role="search" @submit.prevent="submitSearch">
        <Icon name="search" :size="20" /><input
          v-model="search"
          type="search"
          :placeholder="mediaType === 'tv' ? 'Search TV shows…' : 'Search movies…'"
          :aria-label="mediaType === 'tv' ? 'Search TV shows' : 'Search movies'"
          @input="queueSearch"
        /><button type="submit" class="search-submit icon-button" aria-label="Submit search">
          <Icon name="arrow" :size="18" />
        </button>
      </form>
      <div class="browse-options">
        <div class="media-toggle" aria-label="Title type">
          <button
            :aria-pressed="mediaType === 'movie'"
            :class="{ active: mediaType === 'movie' }"
            @click="setMediaType('movie')"
          >
            Movies</button
          ><button
            :aria-pressed="mediaType === 'tv'"
            :class="{ active: mediaType === 'tv' }"
            @click="setMediaType('tv')"
          >
            TV shows
          </button>
        </div>
        <button
          class="button filter-button"
          :class="{ selected: filtersOpen || filterCount }"
          :aria-expanded="filtersOpen"
          aria-controls="browse-filters"
          @click="filtersOpen = !filtersOpen"
        >
          <Icon name="sliders" :size="17" /> Filters
          <span v-if="filterCount" class="filter-count">{{ filterCount }}</span>
        </button>
      </div>
    </div>
    <div v-if="filtersOpen" id="browse-filters" class="filter-panel">
      <p v-if="query" class="filter-notice">
        Filters apply when exploring.
        <button
          class="text-link"
          @click="
            search = '';
            submitSearch();
          "
        >
          Clear search to use filters
        </button>
      </p>
      <fieldset :disabled="!!query">
        <legend class="sr-only">Filter titles</legend>
        <div class="filter-field">
          <span>Release date</span>
          <AppSelect
            :model-value="era"
            :options="eras"
            :disabled="!!query"
            label="Release date"
            @update:model-value="setFilter('era', $event)"
          />
        </div>
        <div class="filter-field">
          <span>Genre</span>
          <AppSelect
            :model-value="genre"
            :options="genreOptions"
            :disabled="!!query"
            label="Genre"
            @update:model-value="setFilter('genre', $event)"
          />
        </div>
        <div class="filter-field">
          <span>Minimum ratings</span>
          <AppSelect
            :model-value="votes"
            :options="minimumVotesOptions"
            :disabled="!!query"
            label="Minimum ratings"
            @update:model-value="setFilter('votes', $event)"
          />
        </div>
      </fieldset>
      <button class="text-link" @click="reset">Reset filters</button>
    </div>
    <div v-if="!query" class="genre-row" aria-label="Genres">
      <button
        v-for="g in genres"
        :key="g.id"
        class="genre-chip"
        :class="{ active: String(genre) === String(g.id) }"
        :aria-pressed="String(genre) === String(g.id)"
        @click="setFilter('genre', String(g.id))"
      >
        {{ g.id ? g.name : "All genres" }}
      </button>
    </div>
    <div ref="resultsHeading" class="results-heading">
      <h2>
        {{
          query
            ? "Search results"
            : showingCollection && collection === "trending"
            ? "This week’s favorites"
            : sortBy === "vote_average.desc"
            ? "Audience favorites"
            : genre
            ? genres.find((g) => String(g.id) === genre)?.name
            : "All titles"
        }}<span v-if="!loading && !error">{{ totalResults.toLocaleString() }}</span>
      </h2>
      <div v-if="!query" class="browse-sort">
        <span>Sort by</span>
        <AppSelect
          :model-value="showingCollection ? collection : sortBy"
          :options="sortOptions"
          label="Sort titles"
          @update:model-value="
            discoverySortOptions.some((option) => option.value === $event) && setFilter('sort', $event)
          "
        />
      </div>
      <span v-else class="page-info">Ordered by relevance</span>
    </div>
    <div class="ranking-context">
      <p class="sort-note">{{ rankingNote }}</p>
      <details class="ranking-guide">
        <summary>How rankings work</summary>
        <div>
          <p>
            <strong>Popular right now</strong> uses TMDB’s popularity score, which combines recent attention
            with longer-term activity. The weekly trending collection is a separate chart.
          </p>
          <p>
            <strong>Most rated — all time</strong> orders titles by their total number of TMDB ratings. It’s a
            measure of audience participation, not how many people liked a title or watched it.
          </p>
          <p>
            <strong>Highest / lowest rated</strong> orders by the TMDB audience score, with at least 1,000
            ratings by default. Change Minimum ratings in Filters to include smaller audiences or require more
            votes. This is a score sort with a vote threshold, not a separate weighted chart.
          </p>
          <p>
            <strong>Why it differs from IMDb:</strong> these scores come from TMDB voters. IMDb has a
            different voter community and uses its own weighting for its charts. Your personal star ratings
            stay separate.
          </p>
          <p class="ranking-sources">
            <a
              href="https://developer.themoviedb.org/docs/popularity-and-trending"
              target="_blank"
              rel="noopener noreferrer"
              >TMDB’s ranking guide <span class="sr-only">(opens a new tab)</span></a
            ><a
              href="https://help.imdb.com/article/imdb/track-movies-tv/faq-for-imdb-ratings/G67Y87TFYYP6TWAV"
              target="_blank"
              rel="noopener noreferrer"
              >IMDb’s ratings guide <span class="sr-only">(opens a new tab)</span></a
            >
          </p>
        </div>
      </details>
    </div>
    <div class="sr-only" role="status">
      {{ loading ? "Loading titles" : error ? "Could not load titles" : `${totalResults} titles found` }}
    </div>
    <div v-if="error" class="empty-state">
      <Icon name="film" />
      <h2>A brief intermission.</h2>
      <p>We couldn’t load these titles. Check your connection and try again.</p>
      <button class="button primary" @click="load">Try again</button>
    </div>
    <div v-else-if="loading" class="movie-grid" aria-label="Loading titles" aria-busy="true">
      <div v-for="n in 12" :key="n">
        <div class="skeleton-poster"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>
    <div v-else-if="movies.length" class="movie-grid">
      <MovieCard v-for="movie in movies" :key="`${mediaType}-${movie.id}`" :movie="movie" :type="mediaType" />
    </div>
    <div v-else class="empty-state">
      <Icon name="search" />
      <h2>No matches this time.</h2>
      <p>Try another title or give your filters a little more room.</p>
      <button class="button" @click="reset">Explore all titles</button>
    </div>
    <nav v-if="!error && totalPages > 1" class="pagination" aria-label="Result pages">
      <button class="button quiet" :disabled="page === 1 || loading" @click="navigate(-1)">
        <Icon name="left" :size="17" /> Previous</button
      ><span
        >{{ page }} <span class="muted">/ {{ totalPages }}</span></span
      ><button class="button quiet" :disabled="page >= totalPages || loading" @click="navigate(1)">
        Next <Icon name="right" :size="17" />
      </button>
    </nav>
  </main>
  <Footer />
</template>
<style scoped>
.browse-view {
  padding-block: 3.5rem 1rem;
  min-height: 70vh;
}
.browse-intro h1 {
  font-size: clamp(2rem, 3.5vw, 3.2rem);
  margin-block: 1rem 0.8rem;
  overflow-wrap: anywhere;
}
.browse-intro > .muted {
  font-size: 0.9rem;
}
.browse-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2.3rem;
}
.search-form {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
  max-width: 580px;
  padding: 3px 4px 3px 16px;
  border: 1px solid var(--border);
  background: #141821;
  border-radius: 9px;
  color: var(--text-muted);
}
.search-form:focus-within {
  border-color: var(--accent);
}
.search-form input {
  width: 100%;
  min-width: 0;
  border: 0;
  background: none;
  min-height: 44px;
  padding: 0.4rem 0;
  color: white;
  font-size: 0.85rem;
  outline: none;
}
.search-form input::placeholder {
  color: var(--text-muted);
}
.search-submit {
  width: 40px;
  height: 44px;
  border-radius: 6px;
  background: transparent;
}
.browse-options {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}
.media-toggle {
  display: flex;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 4px;
}
.media-toggle button {
  min-height: 40px;
  padding: 0.5rem 1.05rem;
  background: none;
  font-size: 0.8rem;
  color: var(--text-muted);
  border-radius: 6px;
  white-space: nowrap;
}
.media-toggle button.active {
  background: #293244;
  color: white;
}
.filter-button {
  min-height: 50px;
  background: none;
  font-size: 0.8rem;
}
.filter-button.selected {
  border-color: #99bbff66;
  color: #b3cdff;
}
.filter-count {
  background: var(--accent-soft);
  border-radius: 4px;
  font-size: 0.7rem;
  padding: 0.15rem 0.35rem;
}
.filter-panel {
  padding: 1.3rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-top: 1rem;
}
.filter-panel fieldset {
  border: 0;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.filter-field {
  color: var(--text-secondary);
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.filter-panel fieldset:disabled {
  opacity: 0.4;
}
.filter-notice {
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}
.filter-notice button {
  color: var(--accent);
}
.filter-panel > .text-link {
  font-size: 0.75rem;
  margin-top: 1rem;
}
.genre-row {
  display: flex;
  gap: 0.5rem;
  padding-block: 1.3rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #343b4a transparent;
}
.genre-chip {
  flex-shrink: 0;
  min-height: 36px;
  padding: 0.45rem 0.9rem;
  border-radius: 30px;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  background: none;
  font-size: 0.75rem;
}
.genre-chip.active {
  background: #e7edf8;
  color: #172036;
  border-color: transparent;
}
.results-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-block: 1.3rem 1.6rem;
  scroll-margin-top: calc(var(--header-height) + 20px);
}
.results-heading h2 {
  font-family: "DM Sans", sans-serif;
  font-size: 1rem;
  font-weight: 550;
}
.results-heading h2 span {
  margin-left: 0.6rem;
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 400;
}
.page-info {
  font-size: 0.7rem;
  color: var(--text-muted);
}
.browse-sort {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 290px;
  flex-shrink: 0;
}
.browse-sort > span {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.ranking-context {
  margin: -0.65rem 0 1.5rem;
}
.sort-note {
  color: var(--text-muted);
  font-size: 0.75rem;
  line-height: 1.7;
}
.ranking-guide {
  margin-top: 0.4rem;
  font-size: 0.75rem;
}
.ranking-guide summary {
  width: fit-content;
  padding-block: 0.5rem;
  color: var(--accent);
  cursor: pointer;
}
.ranking-guide > div {
  margin-top: 0.5rem;
  padding: 1.25rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
}
.ranking-guide p {
  line-height: 1.8;
  color: var(--text-secondary);
  max-width: 95ch;
}
.ranking-guide p + p {
  margin-top: 0.65rem;
}
.ranking-guide strong {
  color: var(--text);
  font-weight: 600;
}
.ranking-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.ranking-sources a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding-top: 3rem;
  font-size: 0.8rem;
}
@media (max-width: 800px) {
  .browse-controls {
    flex-wrap: wrap;
    gap: 0.8rem;
  }
  .search-form {
    flex-basis: 100%;
    max-width: none;
  }
  .browse-options {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
}
@media (max-width: 700px) {
  .browse-view {
    padding-top: 2rem;
  }
  .browse-intro h1 {
    font-size: 2rem;
  }
  .browse-intro .eyebrow {
    font-size: 0.58rem;
  }
  .browse-intro > .muted {
    font-size: 0.8rem;
  }
  .browse-controls {
    margin-top: 1.5rem;
  }
  .genre-row {
    padding-block: 1rem;
  }
  .genre-chip {
    min-height: 44px;
  }
  .filter-panel fieldset {
    grid-template-columns: 1fr;
  }
  .filter-button {
    min-height: 48px;
  }
  .media-toggle button {
    min-height: 38px;
  }
  .results-heading {
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  .browse-sort {
    width: 100%;
  }
  .pagination {
    gap: 0.5rem;
  }
}
</style>
