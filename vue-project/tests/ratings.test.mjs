import test from "node:test";
import assert from "node:assert/strict";
import { audienceRating, ratingCount } from "../src/lib/ratings.js";
import { libraryItem } from "../src/lib/media.js";
import { changeLibrary } from "../src/lib/library.js";

test("rating displays include the source, full vote count, and compact count", () => {
  const rating = audienceRating({ vote_average: 8.678, vote_count: 12345 });
  assert.equal(rating.score, "8.7");
  assert.equal(rating.countText, "12,345 ratings");
  assert.equal(rating.compactCount, "12.3K ratings");
  assert.equal(rating.description, "8.7 out of 10 on TMDB. 12,345 ratings.");
  assert.equal(audienceRating({ vote_average: 7, vote_count: 1 }).countText, "1 rating");
});

test("unknown rating counts remain distinct from zero votes and invalid scores", () => {
  for (const count of [undefined, null, "", -1, NaN, Infinity, 0.5]) assert.equal(ratingCount(count), null);
  assert.equal(ratingCount(0), 0);
  assert.equal(audienceRating({ vote_average: 8, vote_count: 0 }).score, null);
  assert.equal(audienceRating({ vote_average: 0, vote_count: 0 }).countText, "0 ratings");
  assert.equal(audienceRating({ vote_average: 8 }).countText, "Rating count unavailable");
  assert.equal(audienceRating({ vote_average: 8 }).score, "8.0");
  for (const score of [undefined, NaN, Infinity, -1, 11])
    assert.equal(audienceRating({ vote_average: score }).score, null);
});

test("vote counts survive saving, watching, and personal rating changes", () => {
  const item = libraryItem({
    id: 1399,
    media_type: "tv",
    name: "Example series",
    vote_average: 8.4,
    vote_count: 10001,
  });
  assert.equal(item.vote_count, 10001);
  const saved = changeLibrary({ movies: [], watched: [] }, { kind: "add", item });
  const watched = changeLibrary(saved, {
    kind: "watch",
    item,
    watchedAt: "2026-09-30T12:00:00Z",
    entryId: "rating-test",
  });
  const rated = changeLibrary(watched, { kind: "rate", item: watched.result, rating: 2 });
  assert.equal(rated.watched[0].vote_count, 10001);
  assert.equal(rated.watched[0].vote_average, 8.4);
  assert.equal(rated.watched[0].rating, 2);
  assert.equal(libraryItem({ id: 1, title: "Legacy entry", vote_average: 8 }).vote_count, null);
});
