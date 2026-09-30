export const discoverySortOptions = [
  { value: "popularity.desc", label: "Popular right now" },
  { value: "vote_average.desc", label: "Highest rated" },
  { value: "vote_average.asc", label: "Lowest rated" },
  { value: "vote_count.desc", label: "Most rated — all time" },
  { value: "primary_release_date.desc", label: "Newest releases" },
  { value: "primary_release_date.asc", label: "Oldest releases" },
];

export const minimumVotesOptions = [
  { value: "auto", label: "Recommended" },
  { value: "0", label: "Any number" },
  ...[100, 500, 1000, 5000, 10000].map((count) => ({
    value: String(count),
    label: `${count.toLocaleString("en")}+ ratings`,
  })),
];

export function minimumVotesFor(sort, votes = "auto", era = "") {
  if (votes !== "auto" && minimumVotesOptions.some((option) => option.value === votes)) return Number(votes);
  if (sort.startsWith("vote_average")) return 1000;
  if (sort.startsWith("primary_release_date") && era !== "upcoming") return 10;
  return 0;
}

export function discoveryParams(
  { mediaType = "movie", sort = "popularity.desc", genre = "", era = "", votes = "auto" } = {},
  now = new Date()
) {
  const dateKey = mediaType === "tv" ? "first_air_date" : "primary_release_date";
  const validSort = discoverySortOptions.some((option) => option.value === sort) ? sort : "popularity.desc";
  return {
    sort_by: validSort.replace("primary_release_date", dateKey),
    ...(genre && { with_genres: genre }),
    ...(validSort.startsWith("primary_release_date") && {
      [`${dateKey}.lte`]: now.toISOString().slice(0, 10),
    }),
    ...eraParams(era, mediaType, now),
    "vote_count.gte": minimumVotesFor(validSort, votes, era),
  };
}

export const movieGenres = [
  { id: "", name: "All" },
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10770, name: "TV Movie" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export const tvGenres = [
  { id: "", name: "All" },
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

export function eraParams(era, mediaType, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const year = now.getFullYear();
  const dateKey = mediaType === "tv" ? "first_air_date" : "primary_release_date";
  const daysFromNow = (days) => new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);
  switch (era) {
    case "now_playing":
      return mediaType === "tv"
        ? { "air_date.gte": daysFromNow(-30), "air_date.lte": today }
        : { with_release_type: "2|3", "release_date.gte": daysFromNow(-45), "release_date.lte": today };
    case "upcoming":
      return {
        [`${dateKey}.gte`]: daysFromNow(1),
        [`${dateKey}.lte`]: daysFromNow(365),
        "vote_count.gte": 0,
      };
    case "this_year":
      return { [`${dateKey}.gte`]: `${year}-01-01`, [`${dateKey}.lte`]: today };
    case "last_5":
      return { [`${dateKey}.gte`]: `${year - 5}-01-01`, [`${dateKey}.lte`]: today };
    case "older":
      return { [`${dateKey}.lte`]: "1979-12-31" };
    default: {
      if (!/^\d{4}s$/.test(era)) return {};
      const start = parseInt(era, 10);
      return { [`${dateKey}.gte`]: `${start}-01-01`, [`${dateKey}.lte`]: `${start + 9}-12-31` };
    }
  }
}
