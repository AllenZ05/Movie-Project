<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useStore } from "../store";
import { getTitles, isCancelled } from "../lib/tmdb";
import { imageUrl, titleOf, yearOf, libraryItem, mediaKey } from "../lib/media";
import { useTitleNavigation } from "../composables/useTitleNavigation";
import Icon from "./Icon.vue";
import AudienceRating from "./AudienceRating.vue";
import StarRating from "./StarRating.vue";
import Toasts from "./Toasts.vue";
const props = defineProps({ id: String, type: { type: String, default: "movie" } });
const emit = defineEmits(["close"]);
const store = useStore();
const { signIn } = useTitleNavigation();
const dialog = ref(null);
const movie = ref(null);
const loading = ref(true);
const showTrailer = ref(false);
const trailerPanel = ref(null);
const brokenPoster = ref(false);
const busy = computed(() => store.libraryBusy || store.libraryError);
const item = computed(() => libraryItem(movie.value || { id: props.id }, props.type));
const saved = computed(() => store.isSaved(item.value));
const watched = computed(() => store.watchHistory.find((entry) => mediaKey(entry) === mediaKey(item.value)));
const trailer = computed(() => {
  const videos = movie.value?.videos?.results || [];
  return (
    videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) ||
    videos.find((video) => video.site === "YouTube" && video.type === "Trailer")
  );
});
const runtime = computed(() => {
  const minutes = movie.value?.runtime;
  return minutes
    ? `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)}h ` : ""}${
        minutes % 60 ? `${minutes % 60}m` : ""
      }`.trim()
    : "";
});
const director = computed(
  () => movie.value?.credits?.crew?.find((person) => person.job === "Director")?.name
);
const money = (value) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    value
  );
const releaseDate = computed(() => {
  const value = movie.value?.release_date || movie.value?.first_air_date;
  return value
    ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
});
let controller;
let opener;
let scrollY = 0;
let originalBodyStyles;
let closing = false;
const close = () => {
  if (!closing) {
    closing = true;
    emit("close");
  }
};
const containTab = (event) => {
  const controls = [
    ...dialog.value.querySelectorAll("button, a[href], input, select, textarea, summary, iframe, [tabindex]"),
  ].filter(
    (element) => element.tabIndex >= 0 && !element.matches(":disabled") && element.getClientRects().length
  );
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
};
const onBackdropClick = (event) => {
  if (event.target !== dialog.value) return;
  const bounds = dialog.value.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    close();
};
const load = async () => {
  controller?.abort();
  controller = new AbortController();
  loading.value = true;
  try {
    movie.value = await getTitles(
      `/${props.type}/${props.id}`,
      { append_to_response: "credits,videos" },
      controller.signal
    );
    document.title = `${titleOf(movie.value)} · 123A Movies`;
  } catch (error) {
    if (!isCancelled(error)) movie.value = null;
  } finally {
    if (!controller.signal.aborted) loading.value = false;
  }
};
const toggleSaved = async () => {
  if (!store.user) return signIn();
  if (saved.value) await store.removeFromWatchlist(item.value);
  else if ((await store.addToWatchlist(item.value)) === "added")
    store.addToast(`Saved “${item.value.title}” to your watchlist`);
};
const toggleWatched = async () => {
  if (!store.user) return signIn();
  if (watched.value) await store.removeFromHistory(watched.value);
  else await store.markWatched(item.value);
};
const playTrailer = async () => {
  showTrailer.value = !showTrailer.value;
  if (showTrailer.value) {
    await nextTick();
    trailerPanel.value?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
    });
  }
};
const share = async () => {
  try {
    if (navigator.share) await navigator.share({ title: titleOf(movie.value), url: window.location.href });
    else {
      await navigator.clipboard.writeText(window.location.href);
      store.addToast("Link copied. Share a great find.");
    }
  } catch (error) {
    if (error.name !== "AbortError")
      store.addToast("Copy the link from your address bar to share this title.", "error");
  }
};
onMounted(() => {
  opener = document.activeElement;
  scrollY = window.scrollY;
  originalBodyStyles = Object.fromEntries(
    ["position", "top", "left", "right"].map((key) => [key, document.body.style[key]])
  );
  Object.assign(document.body.style, { position: "fixed", top: `-${scrollY}px`, left: "0", right: "0" });
  dialog.value.showModal();
  load();
});
onUnmounted(() => {
  controller?.abort();
  dialog.value?.close();
  if (originalBodyStyles) Object.assign(document.body.style, originalBodyStyles);
  window.scrollTo(0, scrollY);
  if (opener?.isConnected) opener.focus({ preventScroll: true });
  else document.querySelector("#main-content")?.focus({ preventScroll: true });
});
</script>
<template>
  <dialog
    ref="dialog"
    class="title-dialog"
    aria-labelledby="detail-title"
    @cancel.prevent="close"
    @click="onBackdropClick"
    @keydown.tab="containTab"
  >
    <button class="dialog-close icon-button" aria-label="Close title details" autofocus @click="close">
      <Icon name="close" :size="20" />
    </button>
    <div class="detail-scroll">
      <div v-if="loading" class="detail-loading" aria-busy="true" aria-label="Loading title details">
        <div class="skeleton-poster"></div>
        <h1 id="detail-title">Finding your story…</h1>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
      <template v-else-if="movie">
        <div class="detail-backdrop">
          <img v-if="movie.backdrop_path" :src="imageUrl(movie.backdrop_path, 'w1280')" alt="" />
          <div class="backdrop-shade"></div>
          <span class="detail-kind">{{ type === "tv" ? "TV SERIES" : "MOVIE" }}</span>
        </div>
        <div class="detail-content">
          <div class="detail-heading">
            <img
              v-if="movie.poster_path && !brokenPoster"
              class="detail-poster"
              :src="imageUrl(movie.poster_path, 'w185')"
              alt=""
              width="100"
              height="150"
              @error="brokenPoster = true"
            />
            <div class="detail-title-block">
              <h1 id="detail-title">{{ titleOf(movie) }}</h1>
              <div class="detail-meta">
                <span>{{ yearOf(movie.release_date || movie.first_air_date) }}</span
                ><span v-if="runtime">{{ runtime }}</span
                ><span v-if="type === 'tv' && movie.number_of_seasons"
                  >{{ movie.number_of_seasons }}
                  {{ movie.number_of_seasons === 1 ? "season" : "seasons" }}</span
                >
              </div>
              <AudienceRating class="detail-audience" :item="movie" />
              <div class="detail-genres">
                <span v-for="genre in movie.genres" :key="genre.id">{{ genre.name }}</span>
              </div>
            </div>
          </div>
          <div class="detail-actions">
            <button
              class="button primary"
              :disabled="!!store.user && busy"
              :aria-pressed="saved"
              @click="toggleSaved"
            >
              <Icon :name="saved ? 'check' : 'plus'" :size="18" />{{
                saved ? "In watchlist" : "Watchlist"
              }}</button
            ><button
              class="button"
              :class="{ watched: !!watched }"
              :disabled="!!store.user && busy"
              :aria-pressed="!!watched"
              :aria-label="watched ? 'Remove from watch history' : 'Mark as watched'"
              @click="toggleWatched"
            >
              <Icon name="check" :size="17" />{{ watched ? "Watched" : "Watched it" }}</button
            ><button
              v-if="trailer"
              class="button quiet trailer-button"
              :aria-expanded="showTrailer"
              aria-controls="trailer-panel"
              @click="playTrailer"
            >
              <Icon name="play" :size="17" />{{ showTrailer ? "Hide trailer" : "Watch trailer" }}</button
            ><button class="icon-button share-button" aria-label="Share this title" @click="share">
              <Icon name="share" :size="18" />
            </button>
          </div>
          <p v-if="!store.user" class="save-hint">Sign in to save titles and keep track of what you watch.</p>
          <p v-if="store.libraryError" class="library-warning" role="alert">
            Your library couldn’t be loaded.
            <button class="text-link" @click="store.loadLibrary()">Try again</button>
          </p>
          <div v-if="watched" class="personal-rating">
            <span>Your rating</span><StarRating :item="watched" />
          </div>
          <div v-if="showTrailer && trailer" id="trailer-panel" ref="trailerPanel" class="trailer-panel">
            <iframe
              :src="`https://www.youtube.com/embed/${encodeURIComponent(trailer.key)}?autoplay=1`"
              :title="`${titleOf(movie)} trailer`"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p v-if="movie.tagline" class="tagline">{{ movie.tagline }}</p>
          <p class="synopsis">{{ movie.overview || "A synopsis isn’t available for this title yet." }}</p>
          <section v-if="movie.credits?.cast?.length" class="cast-section" aria-labelledby="cast-heading">
            <h2 id="cast-heading">The people behind the story</h2>
            <div class="cast-list">
              <div v-for="person in movie.credits.cast.slice(0, 5)" :key="person.id" class="cast-person">
                <img
                  v-if="person.profile_path"
                  :src="imageUrl(person.profile_path, 'w185')"
                  alt=""
                  loading="lazy"
                  width="56"
                  height="56"
                /><span v-else class="cast-placeholder">{{ person.name[0] }}</span
                ><span
                  ><strong>{{ person.name }}</strong
                  ><small>{{ person.character }}</small></span
                >
              </div>
            </div>
          </section>
          <details class="more-details">
            <summary>More about this {{ type === "tv" ? "series" : "film" }}</summary>
            <dl>
              <template v-if="releaseDate"
                ><dt>{{ type === "tv" ? "First aired" : "Release date" }}</dt>
                <dd>{{ releaseDate }}</dd></template
              ><template v-if="director"
                ><dt>Director</dt>
                <dd>{{ director }}</dd></template
              ><template v-if="type === 'tv' && movie.created_by?.length"
                ><dt>Created by</dt>
                <dd>{{ movie.created_by.map((person) => person.name).join(", ") }}</dd></template
              ><template v-if="movie.budget"
                ><dt>Budget</dt>
                <dd>{{ money(movie.budget) }}</dd></template
              ><template v-if="movie.revenue"
                ><dt>Box office</dt>
                <dd>{{ money(movie.revenue) }}</dd></template
              ><template v-if="movie.number_of_episodes"
                ><dt>Episodes</dt>
                <dd>{{ movie.number_of_episodes }}</dd></template
              ><template v-if="movie.status"
                ><dt>Status</dt>
                <dd>{{ movie.status }}</dd></template
              ><template v-if="movie.vote_count"
                ><dt>Audience rating</dt>
                <dd>{{ movie.vote_count.toLocaleString() }} votes on TMDB</dd></template
              >
            </dl>
          </details>
        </div>
      </template>
      <div v-else class="detail-error empty-state">
        <Icon name="film" />
        <h1 id="detail-title">A brief intermission.</h1>
        <p>We couldn’t load this title. Please try again.</p>
        <button class="button primary" @click="load">Try again</button>
      </div>
    </div>
    <Toasts />
  </dialog>
</template>
<style scoped>
.title-dialog {
  padding: 0;
  width: min(900px, calc(100% - 48px));
  max-width: none;
  max-height: min(90dvh, 1050px);
  overflow: visible;
  border: 1px solid #ffffff18;
  background: #131720;
  color: var(--text);
  border-radius: 18px;
  box-shadow: 0 35px 140px #000b;
}
.title-dialog[open] {
  animation: arrive 0.2s ease-out;
}
.title-dialog::backdrop {
  background: #02050bd1;
  backdrop-filter: blur(8px);
}
@keyframes arrive {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.dialog-close {
  position: absolute;
  right: 14px;
  top: 14px;
  z-index: 3;
  background: #0a0d16d9;
  border: 1px solid #ffffff2b;
}
.detail-scroll {
  max-height: min(90dvh, 1050px);
  overflow-y: auto;
  overscroll-behavior: contain;
  border-radius: 18px;
}
.detail-backdrop {
  height: 260px;
  position: relative;
  background: linear-gradient(140deg, #243b59, #161e2e);
}
.detail-backdrop > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 28%;
}
.backdrop-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, #131720, #13172008 100%);
}
.detail-kind {
  position: absolute;
  bottom: 50px;
  left: 36px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #d1dced;
}
.detail-content {
  padding: 0 36px 30px;
  position: relative;
  margin-top: -28px;
}
.detail-heading {
  display: flex;
  align-items: flex-end;
  gap: 1.3rem;
}
.detail-poster {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 7px;
  border: 1px solid #ffffff24;
  flex-shrink: 0;
}
.detail-title-block {
  min-width: 0;
  padding-bottom: 0.3rem;
}
.detail-heading h1 {
  font-size: clamp(1.5rem, 3.1vw, 2.6rem);
  line-height: 1.15;
  text-wrap: balance;
}
.detail-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
  color: #b5bccb;
  font-size: 0.8rem;
  margin-top: 0.8rem;
}
.detail-audience {
  margin-top: 0.65rem;
}
.detail-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.detail-genres span {
  padding: 0.25rem 0.55rem;
  font-size: 0.65rem;
  background: #ffffff08;
  border: 1px solid #ffffff12;
  border-radius: 5px;
  color: #bfc7d5;
}
.detail-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 1.6rem;
  align-items: center;
}
.detail-actions .button {
  font-size: 0.8rem;
}
.share-button {
  margin-left: auto;
  background: none;
  border-radius: 8px;
  color: var(--text-secondary);
}
.watched {
  color: var(--success);
  border-color: #95dfbb44;
}
.save-hint {
  margin-top: 0.8rem;
  color: var(--text-muted);
  font-size: 0.7rem;
}
.library-warning {
  font-size: 0.8rem;
  color: var(--danger);
  margin-top: 0.7rem;
}
.personal-rating {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
}
.tagline {
  font-style: italic;
  font-size: 0.85rem;
  color: #b3bed2;
  margin-top: 1.8rem;
}
.synopsis {
  margin-top: 1rem;
  color: #c7cdd9;
  font-size: 0.9rem;
  line-height: 1.85;
  max-width: 740px;
}
.cast-section {
  margin-top: 2rem;
}
.cast-section h2 {
  font-size: 1rem;
  margin-bottom: 1rem;
}
.cast-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
}
.cast-person {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.65rem;
  min-width: 0;
}
.cast-person img,
.cast-placeholder {
  height: 56px;
  width: 56px;
  object-fit: cover;
  border-radius: 50%;
}
.cast-placeholder {
  display: grid;
  place-items: center;
  background: var(--surface);
  color: var(--text-muted);
}
.cast-person strong {
  display: block;
  font-size: 0.7rem;
  font-weight: 550;
  line-height: 1.4;
}
.cast-person small {
  display: block;
  font-size: 0.65rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-top: 0.2rem;
}
.more-details {
  border-top: 1px solid var(--border);
  margin-top: 2rem;
  font-size: 0.8rem;
}
.more-details summary {
  cursor: pointer;
  padding-block: 1.2rem;
  color: var(--text-secondary);
}
.more-details dl {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 0.8rem 1rem;
  line-height: 1.5;
}
.more-details dt {
  color: var(--text-muted);
}
.more-details dd {
  margin: 0;
}
.trailer-panel {
  aspect-ratio: 16 / 9;
  margin-top: 1.5rem;
  border-radius: 10px;
  overflow: hidden;
  background: black;
}
.trailer-panel iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
.detail-loading {
  padding: 50px 30px;
}
.detail-loading .skeleton-poster {
  height: 200px;
  width: 100%;
}
.detail-loading h1 {
  margin-top: 1rem;
  font-size: 1.5rem;
}
.detail-error {
  border: 0;
}
.detail-error h1 {
  font-size: 1.5rem;
}
@media (max-width: 700px) {
  .title-dialog {
    width: calc(100% - 20px);
    max-height: 94dvh;
    border-radius: 14px;
  }
  .detail-scroll {
    max-height: 94dvh;
    border-radius: 14px;
  }
  .detail-backdrop {
    height: 165px;
  }
  .detail-kind {
    left: 20px;
    bottom: 32px;
    font-size: 0.52rem;
  }
  .detail-content {
    padding: 0 20px 20px;
    margin-top: -15px;
  }
  .detail-poster {
    display: none;
  }
  .detail-heading h1 {
    font-size: 1.75rem;
  }
  .detail-meta {
    font-size: 0.72rem;
    gap: 0.65rem;
  }
  .detail-actions {
    gap: 0.5rem;
    margin-top: 1.1rem;
  }
  .detail-actions .button {
    font-size: 0.74rem;
    padding-inline: 0.75rem;
  }
  .trailer-button {
    order: 4;
  }
  .share-button {
    width: 38px;
  }
  .synopsis {
    font-size: 0.82rem;
    line-height: 1.8;
  }
  .cast-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem 0.7rem;
  }
  .cast-person:nth-child(n + 4) {
    margin-top: 0.5rem;
  }
}
</style>
