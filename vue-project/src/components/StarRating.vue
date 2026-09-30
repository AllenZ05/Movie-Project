<script setup>
import { useId } from "vue";
import { useStore } from "../store";
import Icon from "./Icon.vue";
defineProps({ item: { type: Object, required: true } });
const store = useStore();
const id = useId();
</script>
<template>
  <fieldset class="stars" :disabled="store.libraryBusy || store.libraryError">
    <legend class="sr-only">Your rating for {{ item.title }}</legend>
    <label v-for="n in 5" :key="n" class="star-label"
      ><input
        type="radio"
        :name="`rating-${id}`"
        :value="n"
        :checked="item.rating === n"
        :aria-label="`${n} star${n > 1 ? 's' : ''}`"
        @change="store.setRating(item, n)" /><Icon
        name="star"
        :size="19"
        :class="{ filled: n <= (item.rating || 0) }" /></label
    ><button
      v-if="item.rating"
      class="clear-rating"
      :aria-label="`Clear rating for ${item.title}`"
      @click="store.setRating(item, null)"
    >
      <Icon name="close" :size="14" />
    </button>
  </fieldset>
</template>
<style scoped>
.stars {
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  border: 0;
  flex-shrink: 0;
}
.star-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 32px;
  height: 40px;
  color: #687187;
}
.star-label input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.star-label .filled {
  color: #e4bd71;
  fill: #e4bd71;
}
.star-label input:focus-visible + .icon {
  outline: 2px solid var(--accent);
  outline-offset: 5px;
  border-radius: 3px;
}
.star-label:has(input:disabled) {
  cursor: wait;
  opacity: 0.55;
}
.clear-rating {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 40px;
  background: none;
  color: var(--text-muted);
}
@media (max-width: 700px) {
  .star-label {
    width: 36px;
    height: 44px;
  }
  .clear-rating {
    width: 44px;
    height: 44px;
  }
}
</style>
