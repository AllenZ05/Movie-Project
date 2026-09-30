<script setup>
import { computed } from "vue";
import { audienceRating } from "../lib/ratings";
import Icon from "./Icon.vue";
const props = defineProps({ item: { type: Object, required: true }, compact: Boolean });
const rating = computed(() => audienceRating(props.item));
</script>
<template>
  <span class="audience-rating" :class="{ compact }" :title="rating.description">
    <span class="audience-score">
      <Icon v-if="rating.score" name="star" :size="12" />
      <span
        >{{ rating.score || "Not rated"
        }}<span v-if="rating.score" :class="compact ? 'sr-only' : 'score-scale'"> / 10</span></span
      >
      <span class="rating-source">TMDB</span>
    </span>
    <span v-if="rating.score || rating.count > 0" class="rating-count">
      <span aria-hidden="true">{{ compact ? rating.compactCount : rating.countText }}</span>
      <span class="sr-only">{{ rating.countText }}</span>
    </span>
  </span>
</template>
<style scoped>
.audience-rating {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem 0.7rem;
  font-size: 0.78rem;
  line-height: 1.5;
}
.audience-score {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-secondary);
  white-space: nowrap;
}
.audience-score .icon {
  color: #dbbf82;
  fill: currentColor;
  stroke-width: 0;
}
.score-scale,
.rating-count,
.rating-source {
  color: var(--text-muted);
}
.rating-source {
  font-size: 0.58rem;
  letter-spacing: 0.03em;
}
.rating-count {
  font-size: 0.72rem;
}
.compact {
  font-size: 0.72rem;
  gap: 0.15rem 0.6rem;
}
.compact .rating-count {
  font-size: 0.65rem;
}
</style>
