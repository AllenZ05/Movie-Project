<script setup>
import { ref, computed } from "vue";
import { useStore } from "../store";
import { useTitleNavigation } from "../composables/useTitleNavigation";
import { imageUrl, yearOf, mediaKey, historyKey } from "../lib/media";
import { filterLibrary, librarySortOptions } from "../lib/libraryFilters";
import AppSelect from "./AppSelect.vue";
import AudienceRating from "./AudienceRating.vue";
import Icon from "./Icon.vue";
import StarRating from "./StarRating.vue";
import Footer from "./Footer.vue";
const props = defineProps({ history: Boolean });
const store = useStore();
const { openTitle } = useTitleNavigation();
const search = ref("");
const sort = ref("newest");
const media = ref("all");
const lastWatchedKey = ref(null);
const failedPosters = ref(new Set());
const lastWatched = computed(() =>
  store.watchHistory.find((item) => historyKey(item) === lastWatchedKey.value)
);
const allItems = computed(() => (props.history ? store.watchHistory : store.watchlist));
const sortOptions = computed(() => librarySortOptions(props.history));
const mediaOptions = computed(() => [
  { value: "all", label: "All", count: allItems.value.length },
  {
    value: "movie",
    label: "Movies",
    count: allItems.value.filter((item) => (item.media_type || "movie") === "movie").length,
  },
  { value: "tv", label: "TV shows", count: allItems.value.filter((item) => item.media_type === "tv").length },
]);
const items = computed(() =>
  filterLibrary(allItems.value, {
    media: media.value,
    search: search.value,
    sort: sort.value,
    history: props.history,
  })
);
const markWatched = async (item) => {
  const entry = await store.markWatched(item);
  if (entry) lastWatchedKey.value = historyKey(entry);
};
const dateOf = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const reset = () => {
  search.value = "";
  media.value = "all";
  sort.value = "newest";
};
</script>
<template>
  <main id="main-content" class="container library-view" tabindex="-1">
    <div class="library-intro">
      <p class="eyebrow">YOUR CORNER OF CINEMA</p>
      <h1>
        {{ history ? "Your watch history." : "Your watchlist."
        }}<span v-if="allItems.length">{{ allItems.length }}</span>
      </h1>
      <p class="muted">
        {{
          history
            ? "The stories you’ve seen. The ones that stayed with you."
            : "For a rainy Sunday. A late night. Whenever you’re ready."
        }}
      </p>
    </div>
    <div class="library-top">
      <nav class="library-tabs" aria-label="Your library">
        <RouterLink to="/watchlist" :class="{ active: !history }"
          ><Icon name="bookmark" :size="17" /> To watch</RouterLink
        ><RouterLink to="/history" :class="{ active: history }"
          ><Icon name="check" :size="17" /> Watched</RouterLink
        >
      </nav>
      <RouterLink class="text-link" to="/browse"
        >Find something new <Icon name="arrow" :size="16"
      /></RouterLink>
    </div>
    <div v-if="lastWatched && !history" class="rating-banner">
      <div>
        <Icon name="check" :size="18" /><span
          >How was <strong>{{ lastWatched.title }}</strong
          >?</span
        >
      </div>
      <StarRating :item="lastWatched" /><button
        class="icon-button"
        aria-label="Dismiss rating prompt"
        @click="lastWatchedKey = null"
      >
        <Icon name="close" :size="16" />
      </button>
    </div>
    <div v-if="allItems.length" class="library-media" role="group" aria-label="Filter your library by type">
      <button
        v-for="option in mediaOptions"
        :key="option.value"
        :aria-pressed="media === option.value"
        :class="{ active: media === option.value }"
        @click="media = option.value"
      >
        {{ option.label }} <span>{{ option.count }}</span>
      </button>
    </div>
    <div v-if="allItems.length" class="library-tools">
      <div class="library-search">
        <Icon name="search" :size="18" /><input
          v-model="search"
          type="search"
          placeholder="Find a saved story…"
          :aria-label="history ? 'Search your watch history' : 'Search your watchlist'"
        />
      </div>
      <div class="library-sort">
        <span>Sort by</span>
        <AppSelect v-model="sort" :options="sortOptions" label="Sort your library" />
      </div>
    </div>
    <div
      v-if="store.libraryLoading"
      class="library-loading"
      aria-busy="true"
      aria-label="Loading your library"
    >
      <div v-for="n in 3" :key="n" class="library-skeleton">
        <div class="skeleton-poster"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>
    <div v-else-if="store.libraryError" class="empty-state">
      <Icon name="bookmark" />
      <h2>Your stories are still yours.</h2>
      <p>We couldn’t load your library. Please try again.</p>
      <button class="button primary" @click="store.loadLibrary()">Try again</button>
    </div>
    <div v-else-if="!allItems.length" class="empty-state">
      <Icon :name="history ? 'clock' : 'bookmark'" />
      <h2>{{ history ? "Every film is a new chapter." : "Your next favorite belongs here." }}</h2>
      <p>
        {{
          history
            ? "Mark a movie or series as watched, then give it your own star rating."
            : "Tap the + on any title to save it for your next movie night."
        }}
      </p>
      <RouterLink class="button primary" to="/browse"
        >Explore movies <Icon name="arrow" :size="17"
      /></RouterLink>
    </div>
    <div v-else-if="!items.length" class="empty-state">
      <Icon name="search" />
      <h2>No matching stories.</h2>
      <p>Try a different title or clear your filters.</p>
      <button class="button" @click="reset">Clear filters</button>
    </div>
    <div v-else class="library-list">
      <article
        v-for="movie in items"
        :key="history ? historyKey(movie) : mediaKey(movie)"
        class="library-row"
      >
        <button class="library-poster" :aria-label="`Details for ${movie.title}`" @click="openTitle(movie)">
          <img
            v-if="movie.poster && !failedPosters.has(mediaKey(movie))"
            :src="imageUrl(movie.poster, 'w185')"
            @error="failedPosters.add(mediaKey(movie))"
            alt=""
            loading="lazy"
            width="92"
            height="138"
          /><Icon v-else name="film" :size="28" />
        </button>
        <div class="library-info">
          <button class="library-title" @click="openTitle(movie)">{{ movie.title }}</button>
          <div class="library-meta">
            <span>{{ (movie.media_type || "movie") === "tv" ? "TV series" : "Movie" }}</span
            ><span v-if="movie.release_date">{{ yearOf(movie.release_date) }}</span
            ><span v-if="movie.runtime">{{ movie.runtime }} min</span>
          </div>
          <p v-if="history" class="watched-date">Watched {{ dateOf(movie.watchedAt) }}</p>
          <p v-else-if="movie.overview" class="library-overview">{{ movie.overview }}</p>
          <AudienceRating class="library-audience" :item="movie" />
        </div>
        <div class="library-row-actions">
          <StarRating v-if="history" :item="movie" /><button
            v-else
            class="button quiet watched-action"
            :disabled="store.libraryBusy"
            @click="markWatched(movie)"
          >
            <Icon name="check" :size="16" /> Watched it</button
          ><button
            class="remove-button icon-button"
            :aria-label="`Remove ${movie.title} from ${history ? 'history' : 'watchlist'}`"
            :disabled="store.libraryBusy"
            @click="history ? store.removeFromHistory(movie) : store.removeFromWatchlist(movie)"
          >
            <Icon name="trash" :size="17" />
          </button>
        </div>
      </article>
    </div>
    <p
      v-if="allItems.length && !store.libraryLoading && !store.libraryError"
      class="library-count"
      role="status"
    >
      {{ items.length }} {{ items.length === 1 ? "story" : "stories"
      }}{{ items.length !== allItems.length ? ` of ${allItems.length}` : "" }} in your
      {{ history ? "history" : "watchlist" }}
    </p>
    <p v-if="allItems.length && !store.libraryLoading && !store.libraryError" class="library-rating-note">
      TMDB scores are saved with each title. Open a title for current scores and rating counts.
    </p>
  </main>
  <Footer />
</template>
<style scoped>
.library-view {
  max-width: 1120px;
  min-height: 70vh;
  padding-top: 3.5rem;
}
.library-intro h1 {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: clamp(2rem, 3.5vw, 3rem);
  margin-block: 1rem 0.8rem;
}
.library-intro h1 span {
  font-family: "DM Sans", sans-serif;
  font-size: 0.85rem;
  font-weight: 400;
  letter-spacing: 0;
  color: var(--text-muted);
  border: 1px solid var(--border);
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}
.library-intro .muted {
  font-size: 0.85rem;
  line-height: 1.7;
}
.library-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
}
.library-tabs {
  display: flex;
  gap: 1.5rem;
}
.library-tabs a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
}
.library-tabs a.active {
  border-color: var(--accent);
  color: white;
}
.library-tools {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
}
.library-media {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: 1rem;
  max-width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-elevated);
}
.library-media button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  white-space: nowrap;
}
.library-media button.active {
  background: #293244;
  color: white;
}
.library-media button span {
  font-size: 0.65rem;
  color: var(--text-muted);
}
.library-media button.active span {
  color: var(--accent);
}
.library-sort {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 0 1 310px;
  min-width: 0;
}
.library-sort > span {
  flex-shrink: 0;
  color: var(--text-muted);
  font-size: 0.75rem;
}
.library-search {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding-left: 0.85rem;
  flex: 1;
  min-width: 0;
  background: var(--bg-elevated);
  color: var(--text-muted);
}
.library-search:focus-within {
  border-color: var(--accent);
}
.library-search input {
  background: none;
  border: 0;
  outline: 0;
  padding: 0.75rem 0.5rem;
  min-height: 46px;
  min-width: 0;
  width: 100%;
  font-size: 0.8rem;
}
.library-row {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.4rem;
  padding: 1.2rem 0;
  border-bottom: 1px solid var(--border);
}
.library-row:first-child {
  padding-top: 0;
}
.library-poster {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 126px;
  padding: 0;
  background: var(--surface);
  color: var(--text-muted);
  border-radius: 7px;
  overflow: hidden;
}
.library-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.library-title {
  padding: 0;
  display: block;
  background: none;
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  text-align: left;
  font-weight: 650;
}
.library-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  color: var(--text-muted);
  font-size: 0.7rem;
  margin-top: 0.4rem;
}
.library-overview {
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-top: 0.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.library-audience {
  margin-top: 0.5rem;
}
.watched-date {
  color: var(--text-muted);
  font-size: 0.72rem;
  margin-top: 0.75rem;
}
.library-row-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.watched-action {
  font-size: 0.75rem;
  color: var(--success);
}
.remove-button {
  background: none;
  color: var(--text-muted);
}
.remove-button:hover {
  color: var(--danger);
}
.library-count {
  color: var(--text-muted);
  font-size: 0.7rem;
  text-align: center;
  margin-top: 2rem;
}
.library-rating-note {
  color: var(--text-muted);
  font-size: 0.7rem;
  text-align: center;
  line-height: 1.7;
  margin-top: 0.6rem;
}
.rating-banner {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  background: #192738;
  border: 1px solid #99bbff30;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  margin-bottom: 1.5rem;
}
.rating-banner > div {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  font-size: 0.8rem;
}
.rating-banner > div .icon {
  color: var(--success);
}
.rating-banner .icon-button {
  background: none;
}
.library-skeleton {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-block: 1rem;
}
.library-skeleton .skeleton-poster {
  width: 84px;
}
.library-skeleton .skeleton-text {
  width: 45%;
}
@media (max-width: 900px) {
  .library-row {
    grid-template-columns: 76px minmax(0, 1fr);
    gap: 0.8rem 1rem;
  }
  .library-poster {
    grid-row: span 2;
    width: 76px;
    height: 114px;
  }
  .library-row-actions {
    grid-column: 2;
  }
}
@media (max-width: 700px) {
  .library-view {
    padding-top: 2rem;
  }
  .library-intro h1 {
    font-size: 1.9rem;
    gap: 0.5rem;
  }
  .library-intro h1 span {
    font-size: 0.7rem;
  }
  .library-intro .eyebrow {
    font-size: 0.58rem;
  }
  .library-intro .muted {
    font-size: 0.8rem;
  }
  .library-top {
    margin-top: 1.3rem;
  }
  .library-top > .text-link {
    font-size: 0.67rem;
  }
  .library-tabs {
    gap: 1rem;
  }
  .library-tabs a {
    font-size: 0.75rem;
    gap: 0.3rem;
  }
  .library-tools {
    flex-wrap: wrap;
  }
  .library-search {
    flex-basis: 100%;
  }
  .library-sort {
    flex-basis: 100%;
  }
  .library-media {
    display: flex;
  }
  .library-media button {
    flex: 1;
    padding-inline: 0.55rem;
    gap: 0.35rem;
  }
  .library-title {
    font-size: 0.87rem;
  }
  .library-overview {
    display: none;
  }
  .library-row {
    align-items: start;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 0.4rem 0.9rem;
  }
  .library-poster {
    width: 64px;
    height: 96px;
  }
  .library-meta {
    font-size: 0.65rem;
    gap: 0.5rem;
  }
  .library-row-actions {
    flex-wrap: wrap;
    gap: 0;
  }
  .watched-action {
    min-height: 40px;
    padding: 0.5rem 0.6rem;
    font-size: 0.7rem;
  }
  .library-row-actions :deep(.star-label) {
    width: 30px;
  }
  .library-row-actions :deep(.clear-rating) {
    width: 28px;
  }
  .remove-button {
    width: 40px;
  }
  .rating-banner {
    gap: 0.4rem;
  }
  .rating-banner > div {
    flex-basis: 100%;
  }
  .rating-banner > .icon-button {
    margin-left: auto;
  }
}
</style>
