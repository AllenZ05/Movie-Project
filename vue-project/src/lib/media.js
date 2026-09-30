import { ratingCount } from "./ratings.js";

export const mediaKey = (item) => `${item.media_type || "movie"}-${item.id}`;
export const historyKey = (item) => item.entryId || `${mediaKey(item)}-${item.watchedAt}`;
export const titleOf = (item) => item.title || item.name || "Untitled";
export const yearOf = (date) => (typeof date === "string" ? date.slice(0, 4) : "");
export const imageUrl = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path.startsWith("/") ? path : `/${path}`}` : "";

export function libraryItem(item, type = item.media_type || "movie") {
  return {
    id: Number(item.id),
    media_type: type,
    title: titleOf(item),
    poster: item.poster_path || item.poster || null,
    overview: item.overview || "",
    release_date: item.release_date || item.first_air_date || null,
    vote_average: item.vote_average || 0,
    vote_count: ratingCount(item.vote_count),
    runtime: item.runtime || null,
    seasons: item.number_of_seasons || item.seasons || null,
    genres: (item.genres || []).map((genre) => (typeof genre === "string" ? genre : genre.name)),
  };
}

export function safeRedirect(value) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !value.split(/[?#]/)[0].match(/^\/login\/?$/)
    ? value
    : "/browse";
}
