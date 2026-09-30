import test from "node:test";
import assert from "node:assert/strict";
import { filterLibrary, librarySortOptions } from "../src/lib/libraryFilters.js";
import { discoveryParams, discoverySortOptions, minimumVotesFor } from "../src/lib/discovery.js";

const items = [
  { id: 1, title: "Vertigo", vote_average: 8.2, release_date: "1958-05-09", rating: 3 },
  { id: 2, name: "Severance", media_type: "tv", vote_average: 8.7, first_air_date: "2022-02-18", rating: 5 },
  {
    id: 3,
    title: "Arrival",
    media_type: "movie",
    vote_average: 7.9,
    release_date: "2016-11-11",
    rating: null,
  },
  { id: 4, title: "Unrated story", media_type: "tv", vote_average: 0 },
];
const ids = (options, source = items) => filterLibrary(source, options).map((item) => item.id);

test("library type and title filters combine and recognize legacy movie entries", () => {
  assert.deepEqual(ids({ media: "movie" }), [3, 1]);
  assert.deepEqual(ids({ media: "tv", search: " SEVER " }), [2]);
  assert.deepEqual(ids({ media: "movie", search: "sever" }), []);
});

test("audience and personal ratings sort independently with unrated entries last", () => {
  assert.deepEqual(ids({ sort: "rating" }), [2, 1, 3, 4]);
  assert.deepEqual(ids({ sort: "rating_asc" }), [3, 1, 2, 4]);
  assert.deepEqual(ids({ sort: "personal", history: true }), [2, 1, 4, 3]);
  assert.deepEqual(ids({ sort: "personal_asc", history: true }), [1, 2, 4, 3]);
  assert.equal(
    librarySortOptions().some((option) => option.value === "personal"),
    false
  );
  assert.equal(
    librarySortOptions(true).some((option) => option.value === "personal"),
    true
  );
});

test("release sorting supports classic movies, TV dates, and missing dates in both directions", () => {
  assert.deepEqual(ids({ sort: "release" }), [2, 3, 1, 4]);
  assert.deepEqual(ids({ sort: "release_asc" }), [1, 3, 2, 4]);
});

test("added order, watched dates, and alphabetical ordering never mutate the library", () => {
  const source = structuredClone(items);
  assert.deepEqual(ids({ sort: "newest" }), [4, 3, 2, 1]);
  assert.deepEqual(ids({ sort: "oldest" }), [1, 2, 3, 4]);
  assert.deepEqual(ids({ sort: "title" }), [3, 2, 4, 1]);
  assert.deepEqual(ids({ sort: "title_desc" }), [1, 4, 2, 3]);
  const watched = [
    { ...items[0], watchedAt: "2026-09-29T12:00:00Z" },
    { ...items[1], watchedAt: "2026-01-01T12:00:00Z" },
    { ...items[2] },
  ];
  assert.deepEqual(ids({ history: true }, watched), [1, 2, 3]);
  assert.deepEqual(ids({ history: true, sort: "oldest" }, watched), [2, 1, 3]);
  assert.deepEqual(items, source);
});

test("catalog sorts map release dates to the correct movie or TV field", () => {
  for (const option of discoverySortOptions) {
    assert.equal(discoveryParams({ sort: option.value }).sort_by, option.value);
    assert.equal(
      discoveryParams({ mediaType: "tv", sort: option.value }).sort_by,
      option.value.replace("primary_release_date", "first_air_date")
    );
  }
  assert.equal(discoveryParams({ sort: "invalid" }).sort_by, "popularity.desc");
});

test("catalog sorting combines genre and era filters without losing rating thresholds", () => {
  const now = new Date("2026-09-29T12:00:00Z");
  assert.deepEqual(
    discoveryParams({ mediaType: "tv", sort: "primary_release_date.asc", genre: "18", era: "1990s" }, now),
    {
      sort_by: "first_air_date.asc",
      with_genres: "18",
      "first_air_date.gte": "1990-01-01",
      "first_air_date.lte": "1999-12-31",
      "vote_count.gte": 10,
    }
  );
  const upcoming = discoveryParams({ sort: "primary_release_date.desc", era: "upcoming" }, now);
  assert.equal(upcoming["primary_release_date.gte"], "2026-09-30");
  assert.equal(upcoming["primary_release_date.lte"], "2027-09-29");
  assert.equal(upcoming["vote_count.gte"], 0);
  for (const sort of ["vote_average.asc", "vote_average.desc"]) {
    assert.equal(discoveryParams({ sort })["vote_count.gte"], 1000);
    assert.equal(discoveryParams({ sort, era: "upcoming" })["vote_count.gte"], 1000);
  }
});

test("minimum rating counts apply across sorts and preserve explicit choices", () => {
  for (const { value: sort } of discoverySortOptions) {
    assert.equal(discoveryParams({ sort, votes: "5000", era: "upcoming" })["vote_count.gte"], 5000);
    assert.equal(discoveryParams({ sort, votes: "0" })["vote_count.gte"], 0);
  }
  assert.equal(minimumVotesFor("vote_average.desc", "invalid"), 1000);
  assert.equal(minimumVotesFor("vote_average.asc", "-1"), 1000);
  assert.equal(minimumVotesFor("popularity.desc"), 0);
  assert.equal(minimumVotesFor("vote_count.desc"), 0);
});
