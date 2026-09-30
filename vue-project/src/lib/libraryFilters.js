import { titleOf } from "./media.js";

export function librarySortOptions(history = false) {
  return [
    { value: "newest", label: history ? "Recently watched" : "Recently added" },
    { value: "oldest", label: history ? "Watched longest ago" : "Added longest ago" },
    { value: "title", label: "Title A–Z" },
    { value: "title_desc", label: "Title Z–A" },
    { value: "rating", label: "TMDB rating: high to low" },
    { value: "rating_asc", label: "TMDB rating: low to high" },
    { value: "release", label: "Release: newest first" },
    { value: "release_asc", label: "Release: oldest first" },
    ...(history
      ? [
          { value: "personal", label: "Your rating: high to low" },
          { value: "personal_asc", label: "Your rating: low to high" },
        ]
      : []),
  ];
}

// Unknown dates and unrated titles belong at the end in either direction.
function compareKnown(a, b, ascending) {
  const aKnown = Number.isFinite(a);
  const bKnown = Number.isFinite(b);
  if (!aKnown || !bKnown) return Number(bKnown) - Number(aKnown);
  return ascending ? a - b : b - a;
}
const dateValue = (item) => Date.parse(item.release_date || item.first_air_date || "");

export function filterLibrary(items, { media = "all", search = "", sort = "newest", history = false } = {}) {
  const term = search.trim().toLocaleLowerCase();
  const filtered = [...items]
    .reverse()
    .filter(
      (item) =>
        (media === "all" || (item.media_type || "movie") === media) &&
        titleOf(item).toLocaleLowerCase().includes(term)
    );
  if (sort === "oldest") filtered.reverse();
  if (history && ["newest", "oldest"].includes(sort))
    filtered.sort((a, b) =>
      compareKnown(Date.parse(a.watchedAt), Date.parse(b.watchedAt), sort === "oldest")
    );
  if (sort === "title" || sort === "title_desc")
    filtered.sort(
      (a, b) =>
        titleOf(a).localeCompare(titleOf(b), undefined, { sensitivity: "base", numeric: true }) *
        (sort === "title" ? 1 : -1)
    );
  if (["rating", "rating_asc", "personal", "personal_asc"].includes(sort)) {
    const key = sort.startsWith("personal") ? "rating" : "vote_average";
    const rating = (item) => (Number(item[key]) > 0 ? Number(item[key]) : NaN);
    filtered.sort((a, b) => compareKnown(rating(a), rating(b), sort.endsWith("_asc")));
  }
  if (sort === "release" || sort === "release_asc")
    filtered.sort((a, b) => compareKnown(dateValue(a), dateValue(b), sort.endsWith("_asc")));
  return filtered;
}
