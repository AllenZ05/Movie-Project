<script setup>
import { computed, ref, watch } from "vue";
import { imageUrl, titleOf, yearOf } from "../lib/media";
import { useTitleNavigation } from "../composables/useTitleNavigation";
import Icon from "./Icon.vue";
import AudienceRating from "./AudienceRating.vue";
const props = defineProps({ featured: Object });
const { openTitle } = useTitleNavigation();
const backdrop = computed(() => imageUrl(props.featured?.backdrop_path, "w1280"));
const imageFailed = ref(false);
watch(backdrop, () => {
  imageFailed.value = false;
});
</script>
<template>
  <section class="hero" aria-labelledby="hero-title">
    <img
      v-if="backdrop && !imageFailed"
      class="hero-art"
      :src="backdrop"
      :srcset="`${imageUrl(featured.backdrop_path, 'w780')} 780w, ${backdrop} 1280w, ${imageUrl(
        featured.backdrop_path,
        'w1920'
      )} 1920w`"
      sizes="100vw"
      alt=""
      fetchpriority="high"
      @error="imageFailed = true"
    />
    <div class="hero-shade"></div>
    <div class="hero-inner container">
      <div class="hero-copy">
        <p class="eyebrow"><span></span> A WORLD OF STORIES</p>
        <h1 id="hero-title">Your next<br />great watch.</h1>
        <p class="hero-description">
          The films you’ll talk about. The series you’ll stay up for. Find them here, and make them yours.
        </p>
        <div class="hero-actions">
          <RouterLink class="button light" to="/browse"
            >Explore movies <Icon name="arrow" :size="18" /></RouterLink
          ><RouterLink class="button hero-secondary" to="/browse?media=tv">Discover TV shows</RouterLink>
        </div>
        <p class="hero-note">Find your favorites. Build your watchlist.</p>
      </div>
      <button v-if="featured" class="spotlight" @click="openTitle(featured)">
        <span class="spotlight-label">IN THE SPOTLIGHT</span
        ><span class="spotlight-title">{{ titleOf(featured) }}<Icon name="arrow" :size="19" /></span
        ><span class="spotlight-meta"
          >{{ yearOf(featured.release_date || featured.first_air_date) }}<span>·</span
          >{{ featured.media_type === "tv" ? "TV series" : "Movie" }}</span
        >
        <AudienceRating :item="featured" compact />
      </button>
    </div>
  </section>
</template>
<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  min-height: 600px;
  background: radial-gradient(ellipse at 75% 25%, #22364b, #111724 60%, var(--bg));
  overflow: hidden;
}
.hero-art {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center 30%;
  z-index: -3;
}
.hero-shade {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: linear-gradient(90deg, #0b0d14f5 0%, #0b0d14c2 30%, #0b0d1420 75%),
    linear-gradient(0deg, var(--bg), #0b0d1433 50%, #0b0d1420);
}
.hero-inner {
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  padding-block: 55px 85px;
}
.hero-copy {
  max-width: 620px;
}
.hero .eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.64rem;
  color: #c3d3ec;
}
.hero .eyebrow span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #a7c7ff;
  box-shadow: 0 0 12px #a7c7ff;
}
.hero h1 {
  font-size: clamp(3.5rem, 6.6vw, 6.5rem);
  font-weight: 750;
  letter-spacing: -0.065em;
  line-height: 1.04;
  margin-block: 1.6rem 1.4rem;
}
.hero-description {
  max-width: 360px;
  font-size: 0.95rem;
  line-height: 1.8;
  color: #c4cad6;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.8rem;
}
.hero-secondary {
  background: #10151e55;
  border-color: #ffffff33;
  backdrop-filter: blur(8px);
}
.hero-note {
  margin-top: 1.4rem;
  color: #9ca6b6;
  font-size: 0.7rem;
}
.spotlight {
  align-self: flex-end;
  min-width: 240px;
  max-width: 350px;
  text-align: left;
  background: #11162066;
  border: 1px solid #ffffff20;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  backdrop-filter: blur(16px);
}
.spotlight-label {
  display: block;
  font-size: 0.57rem;
  letter-spacing: 0.14em;
  color: #c1cad8;
  margin-bottom: 0.65rem;
}
.spotlight-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  font-weight: 700;
}
.spotlight-meta {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.6rem;
  font-size: 0.65rem;
  color: #c1cad8;
}
.spotlight :deep(.audience-rating) {
  margin-top: 0.4rem;
}
@media (max-width: 900px) {
  .hero-inner {
    gap: 1rem;
  }
  .spotlight {
    min-width: 180px;
    max-width: 250px;
  }
}
@media (max-width: 700px) {
  .hero,
  .hero-inner {
    min-height: 610px;
  }
  .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 2rem;
    padding-block: 65px 30px;
  }
  .hero-art {
    object-position: 62% center;
    opacity: 0.65;
  }
  .hero-shade {
    background: linear-gradient(0deg, var(--bg), #0b0d14b8 35%, #0b0d1455 80%, #0b0d1466);
  }
  .hero h1 {
    font-size: clamp(3.2rem, 13vw, 4.8rem);
    margin-block: 1.2rem;
  }
  .hero-description {
    max-width: 290px;
    font-size: 0.85rem;
  }
  .hero-actions {
    gap: 0.6rem;
    margin-top: 1.4rem;
  }
  .hero-actions .button {
    font-size: 0.75rem;
    padding-inline: 0.85rem;
  }
  .hero-note {
    display: none;
  }
  .spotlight {
    align-self: flex-start;
    border: 0;
    border-left: 2px solid #9dbcff70;
    border-radius: 0;
    background: none;
    backdrop-filter: none;
    padding: 0 0 0 0.85rem;
    min-width: 0;
    max-width: 100%;
  }
  .spotlight-label {
    font-size: 0.53rem;
    margin-bottom: 0.4rem;
  }
  .spotlight-title {
    font-size: 0.8rem;
  }
  .spotlight-meta {
    display: none;
  }
}
</style>
