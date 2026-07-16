<script setup>
import { useStore } from "../store";

defineProps(["item"]);
const store = useStore();
</script>

<template>
  <div class="stars" role="radiogroup" aria-label="Your rating">
    <button
      v-for="n in 5"
      :key="n"
      class="star"
      :class="{ filled: n <= (item.rating || 0) }"
      role="radio"
      :aria-checked="item.rating === n"
      :aria-label="`${n} star${n > 1 ? 's' : ''}`"
      @click="store.setRating(item, n)"
    >
      &#9733;
    </button>
  </div>
</template>

<style scoped>
.stars {
  display: flex;
  flex-shrink: 0;
}

.star {
  background: none;
  padding: 0.15rem;
  font-size: 1.25rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.2);
  transition:
    color 0.15s,
    transform 0.1s;
}

.star.filled {
  color: #fbbf24;
}

.star:hover {
  transform: scale(1.2);
}
</style>
