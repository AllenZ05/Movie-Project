<script setup>
import { computed, defineAsyncComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "./store";
import Header from "./components/Header.vue";
import Toasts from "./components/Toasts.vue";
const Modal = defineAsyncComponent(() => import("./components/Modal.vue"));
const store = useStore();
const route = useRoute();
const router = useRouter();
store.initAuth();
const titleId = computed(() =>
  typeof route.query.movie === "string" && /^\d+$/.test(route.query.movie) && route.path !== "/login"
    ? route.query.movie
    : null
);
const closeTitle = () => {
  if (window.history.state?.titleOverlay) {
    router.back();
    return;
  }
  const { movie, type, ...query } = route.query;
  router.replace({ query });
};
</script>
<template>
  <a class="skip-link" href="#main-content">Skip to content</a>
  <Header />
  <div v-if="store.libraryError" class="container library-error" role="alert">
    Your library couldn’t be loaded. <button class="text-link" @click="store.loadLibrary()">Try again</button>
  </div>
  <RouterView />
  <Toasts v-if="!titleId" />
  <Modal
    v-if="titleId"
    :key="`${route.query.type}-${titleId}`"
    :id="titleId"
    :type="route.query.type === 'tv' ? 'tv' : 'movie'"
    @close="closeTitle"
  />
</template>
<style scoped>
.library-error {
  color: var(--danger);
  font-size: 0.85rem;
  padding-block: 0.6rem;
}
.library-error button {
  color: white;
  margin-left: 0.7rem;
}
</style>
