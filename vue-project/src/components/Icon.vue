<script setup>
defineProps({ name: { type: String, default: "film" }, size: { type: [Number, String], default: 20 } });
const paths = {
  search: "m21 21-4.5-4.5 M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0",
  arrow: "M4 12h16 m-6-6 6 6-6 6",
  left: "m14 6-6 6 6 6",
  right: "m10 6 6 6-6 6",
  down: "m6 9 6 6 6-6",
  plus: "M12 5v14 M5 12h14",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12 M6 18 18 6",
  play: "m9 5 11 7-11 7Z",
  bookmark: "M6 3h12v18l-6-4-6 4Z",
  compass: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M16 8l-2.5 5.5L8 16l2.5-5.5Z",
  clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 6v6l4 2",
  film: "M4 3h16v18H4Z M8 3v18 M16 3v18 M4 7h4 M4 12h4 M4 17h4 M16 7h4 M16 12h4 M16 17h4",
  sliders: "M4 7h9 M17 7h3 M4 17h3 M11 17h9 M13 4v6 M7 14v6",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z",
  trash: "M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7",
  share: "M12 16V3 m-4 4 4-4 4 4 M5 12v9h14v-9",
  logout: "M9 3H4v18h5 M9 12h12 m-4-4 4 4-4 4",
};
</script>
<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.film" />
  </svg>
</template>
<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
