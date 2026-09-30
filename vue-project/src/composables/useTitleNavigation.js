import { useRoute, useRouter } from "vue-router";
export function useTitleNavigation() {
  const route = useRoute();
  const router = useRouter();
  const openTitle = (item, type = item.media_type || "movie") =>
    router.push({
      path: route.path,
      query: { ...route.query, movie: String(item.id), type },
      state: { titleOverlay: true },
    });
  const signIn = (item) => {
    const redirect = item
      ? router.resolve({
          path: route.path,
          query: { ...route.query, movie: String(item.id), type: item.media_type || "movie" },
        }).fullPath
      : route.fullPath;
    return router.push({ path: "/login", query: { redirect } });
  };
  return { openTitle, signIn };
}
