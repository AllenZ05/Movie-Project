<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "../store";
import { useTitleNavigation } from "../composables/useTitleNavigation";
import { imageUrl, titleOf, yearOf, libraryItem } from "../lib/media";
import Icon from "./Icon.vue";
import AudienceRating from "./AudienceRating.vue";
const props = defineProps({
  movie: { type: Object, required: true },
  type: { type: String, default: "movie" },
});
const store = useStore();
const { openTitle, signIn } = useTitleNavigation();
const brokenImage = ref(false);
const saving = ref(false);
const item = computed(() => ({ ...props.movie, media_type: props.movie.media_type || props.type }));
const saved = computed(() => store.isSaved(item.value));
const watched = computed(() => store.isWatched(item.value));
watch(
  () => props.movie.id,
  () => {
    brokenImage.value = false;
  }
);
const save = async () => {
  if (!store.user) return signIn(item.value);
  saving.value = true;
  try {
    if (saved.value) await store.removeFromWatchlist(item.value);
    else if ((await store.addToWatchlist(libraryItem(item.value))) === "added")
      store.addToast(`Saved “${titleOf(item.value)}” to your watchlist`);
  } finally {
    saving.value = false;
  }
};
</script>
<template>
  <article class="movie-card">
    <div class="poster-wrap">
      <button class="poster-button" @click="openTitle(item)" :aria-label="`Details for ${titleOf(movie)}`">
        <img
          v-if="(movie.poster_path || movie.poster) && !brokenImage"
          :src="imageUrl(movie.poster_path || movie.poster, 'w342')"
          :srcset="`${imageUrl(movie.poster_path || movie.poster, 'w342')} 342w, ${imageUrl(
            movie.poster_path || movie.poster,
            'w500'
          )} 500w`"
          sizes="(max-width: 700px) 45vw, (max-width: 1100px) 23vw, 16vw"
          alt=""
          loading="lazy"
          width="342"
          height="513"
          @error="brokenImage = true"
        />
        <span v-else class="poster-fallback"
          ><Icon name="film" :size="35" /><span>{{ titleOf(movie) }}</span></span
        >
        <span v-if="watched" class="watched-label"><Icon name="check" :size="12" /> Watched</span>
      </button>
      <button
        class="save-button icon-button"
        :class="{ saved }"
        :disabled="saving || (store.user && (store.libraryBusy || store.libraryError))"
        :aria-label="`${saved ? 'Remove' : 'Save'} ${titleOf(movie)} ${saved ? 'from' : 'to'} watchlist`"
        :aria-pressed="saved"
        @click="save"
      >
        <Icon :name="saved ? 'check' : 'plus'" :size="18" />
      </button>
    </div>
    <button class="card-title" @click="openTitle(item)">{{ titleOf(movie) }}</button>
    <div class="card-meta">
      <span
        >{{ yearOf(movie.release_date || movie.first_air_date) || "Coming soon"
        }}<span class="meta-dot">·</span>{{ item.media_type === "tv" ? "Series" : "Film" }}</span
      >
    </div>
    <AudienceRating class="card-audience" :item="movie" compact />
  </article>
</template>
<style scoped>
.movie-card {
  min-width: 0;
}
.poster-wrap {
  position: relative;
}
.poster-button {
  padding: 0;
  width: 100%;
  display: block;
  background: var(--surface);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 2 / 3;
}
.poster-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.poster-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  color: var(--text-muted);
  background: linear-gradient(150deg, #27374f, #171e2b);
  font-size: 0.85rem;
}
.save-button {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  width: 36px;
  height: 36px;
  background: #0b101acc;
  backdrop-filter: blur(8px);
  border: 1px solid #ffffff26;
}
.save-button.saved {
  color: var(--accent);
  background: #132b50e8;
}
.card-title {
  display: block;
  padding: 0.8rem 0 0.3rem;
  width: 100%;
  text-align: left;
  font-size: 0.82rem;
  line-height: 1.4;
  font-weight: 600;
  background: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
  font-size: 0.7rem;
  color: var(--text-muted);
}
.meta-dot {
  padding: 0 0.4rem;
}
.card-audience {
  margin-top: 0.3rem;
}
.watched-label {
  position: absolute;
  bottom: 0.6rem;
  left: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  background: #0b101ade;
  color: #b0e8ca;
  font-size: 0.65rem;
}
@media (hover: hover) {
  .poster-button:hover img {
    transform: scale(1.04);
  }
  .card-title:hover {
    color: var(--accent);
  }
}
@media (max-width: 700px) {
  .save-button {
    width: 44px;
    height: 44px;
    top: 0.2rem;
    right: 0.2rem;
  }
}
</style>
