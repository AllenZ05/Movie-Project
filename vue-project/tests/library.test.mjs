import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { defineStore as definePiniaStore, createPinia } from "pinia";
import { toRaw } from "vue";
import { changeLibrary, commitLibraryChange } from "../src/lib/library.js";
import { mediaKey, safeRedirect, yearOf } from "../src/lib/media.js";

const movie = { id: 17, media_type: "movie", title: "A film", poster: null };
const tv = { ...movie, media_type: "tv", title: "A series" };

// Load the actual store actions with deterministic Firebase services, without a network or account.
function createHarness() {
  let authCallback;
  let listeners = 0;
  let failCommit = false;
  let readsFail = false;
  let readGate = null;
  const database = new Map();
  const auth = {};
  const source = readFileSync(new URL("../src/store/index.js", import.meta.url), "utf8")
    .replace(/^import .*;\n/gm, "")
    .replace("export const useStore =", "return");
  const defineStore = (id, options) => {
    const store = definePiniaStore(id, options)(createPinia());
    // Reproduce the fresh action proxies installed by Pinia's browser devtools.
    for (const name of Object.keys(options.actions)) {
      const action = store[name];
      store[name] = (...args) => action.apply(new Proxy(store, {}), args);
    }
    return store;
  };
  const snapshot = (key) => ({
    exists: () => database.has(key),
    data: () => structuredClone(database.get(key)),
  });
  const getDoc = async (key) => {
    if (readGate) await readGate;
    if (readsFail) throw new Error("Offline");
    return snapshot(key);
  };
  const runTransaction = async (_, callback) => {
    const pending = new Map();
    const transaction = {
      get: getDoc,
      set: (key, value) => pending.set(key, JSON.parse(JSON.stringify(value))),
    };
    const result = await callback(transaction);
    if (failCommit) {
      failCommit = false;
      throw new Error("Commit rejected");
    }
    for (const [key, value] of pending) database.set(key, value);
    return result;
  };
  const factory = new Function(
    "defineStore",
    "auth",
    "firestore",
    "onAuthStateChanged",
    "signOut",
    "getDoc",
    "doc",
    "runTransaction",
    "commitLibraryChange",
    "mediaKey",
    "setTimeout",
    "getLibraryServices",
    "toRaw",
    source
  );
  const store = factory(
    defineStore,
    auth,
    {},
    (_, cb) => {
      listeners++;
      authCallback = cb;
    },
    async () => authCallback(null),
    getDoc,
    (_, collection, email) => `${collection}/${email}`,
    runTransaction,
    commitLibraryChange,
    mediaKey,
    () => {},
    async () => ({
      firestore: {},
      getDoc,
      doc: (_, collection, email) => `${collection}/${email}`,
      runTransaction,
    }),
    toRaw
  );
  return {
    store,
    database,
    emitAuth: (user) => authCallback(user),
    get listeners() {
      return listeners;
    },
    failNextCommit: () => {
      failCommit = true;
    },
    failReads: () => {
      readsFail = true;
    },
    holdReads: () => {
      let release;
      readGate = new Promise((resolve) => {
        release = resolve;
      });
      return () => {
        readGate = null;
        release();
      };
    },
    restoreReads: () => {
      readsFail = false;
    },
  };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));
async function signedIn() {
  const harness = createHarness();
  const ready = harness.store.initAuth();
  harness.emitAuth({ uid: "one", email: "one@example.test" });
  await ready;
  await settle();
  return harness;
}

test("movie and TV IDs stay distinct, including after removing one", () => {
  let state = changeLibrary({ movies: [], watched: [] }, { kind: "add", item: movie });
  state = changeLibrary(state, { kind: "add", item: tv });
  state = changeLibrary(state, { kind: "remove", item: movie });
  assert.deepEqual(state.movies, [tv]);
});

test("failed history move leaves both persisted documents and local state intact", async () => {
  const { store, database, failNextCommit } = await signedIn();
  await store.addToWatchlist(movie);
  const before = structuredClone([...database]);
  failNextCommit();
  const result = await store.markWatched(movie);
  assert.equal(result, null);
  assert.deepEqual(store.watchlist, [movie]);
  assert.deepEqual(store.watchHistory, []);
  assert.deepEqual([...database], before);
});

test("an overlapping failed add cannot remove the successful title", async () => {
  const { store, failNextCommit } = await signedIn();
  failNextCommit();
  const results = await Promise.all([store.addToWatchlist(movie), store.addToWatchlist(tv)]);
  assert.deepEqual(results, [null, "added"]);
  assert.deepEqual(store.watchlist, [tv]);
  assert.equal(store.pendingWrites, 0);
});

test("a write merges with the latest library instead of overwriting another device", async () => {
  const { store, database } = await signedIn();
  database.set("watchlists/one@example.test", { movies: [tv] });
  await store.addToWatchlist(movie);
  assert.deepEqual(store.watchlist, [tv, movie]);
});

test("moving to history commits both collections and duplicate marking is idempotent", async () => {
  const { store, database } = await signedIn();
  await store.addToWatchlist(movie);
  const entry = await store.markWatched(movie);
  await store.markWatched(movie);
  assert.deepEqual(database.get("watchlists/one@example.test").movies, []);
  assert.equal(database.get("watchHistory/one@example.test").watched.length, 1);
  assert.equal(store.watchHistory[0].entryId, entry.entryId);
});

test("undo restores the removed item without duplicating an intervening addition", async () => {
  const { store } = await signedIn();
  await store.addToWatchlist(movie);
  await store.addToWatchlist(tv);
  await store.removeFromWatchlist(movie);
  const undo = store.toasts.at(-1).action;
  await store.addToWatchlist(movie);
  await undo();
  assert.equal(store.watchlist.filter((item) => mediaKey(item) === mediaKey(movie)).length, 1);
  assert.equal(store.watchlist.length, 2);
});

test("a legacy history entry can be rated and cleared after array replacement", async () => {
  const { store, database } = await signedIn();
  const legacy = { ...movie, watchedAt: "2024-06-01T12:00:00Z", rating: null };
  database.set("watchHistory/one@example.test", { watched: [legacy] });
  await store.setRating(legacy, 4);
  assert.equal(store.watchHistory[0].rating, 4);
  await store.setRating(legacy, null);
  assert.equal(store.watchHistory[0].rating, null);
});

test("authentication readiness waits for restoration and installs only one listener", async () => {
  const harness = createHarness();
  const { store, emitAuth } = harness;
  let ready = false;
  const first = store.initAuth().then(() => {
    ready = true;
  });
  store.initAuth();
  assert.equal(harness.listeners, 1);
  await settle();
  assert.equal(ready, false);
  emitAuth({ uid: "restored", email: "restored@example.test" });
  await first;
  assert.equal(store.user.uid, "restored");
  assert.equal(store.authReady, true);
});

test("failed initial load cannot overwrite an existing library with an empty one", async () => {
  const harness = createHarness();
  harness.database.set("watchlists/one@example.test", { movies: [movie] });
  harness.failReads();
  const ready = harness.store.initAuth();
  harness.emitAuth({ uid: "one", email: "one@example.test" });
  await ready;
  await settle();
  assert.equal(harness.store.libraryError, true);
  assert.equal(await harness.store.addToWatchlist(tv), null);
  assert.deepEqual(harness.database.get("watchlists/one@example.test").movies, [movie]);
  harness.restoreReads();
  await harness.store.loadLibrary();
  assert.deepEqual(harness.store.watchlist, [movie]);
});

test("redirects stay internal and cannot loop through sign-in", () => {
  for (const value of [
    "//example.com",
    "https://example.com",
    "/\\example.com",
    "/login",
    "/login?redirect=/login",
    "/login#form",
  ])
    assert.equal(safeRedirect(value), "/browse");
  assert.equal(safeRedirect("/browse?movie=17&type=tv"), "/browse?movie=17&type=tv");
});

test("calendar years do not shift with the viewer’s time zone", () => {
  assert.equal(yearOf("2026-01-01"), "2026");
});

test("a late library response cannot restore data after sign-out", async () => {
  const harness = createHarness();
  harness.database.set("watchlists/one@example.test", { movies: [movie] });
  const release = harness.holdReads();
  const ready = harness.store.initAuth();
  harness.emitAuth({ uid: "one", email: "one@example.test" });
  await ready;
  await settle();
  harness.emitAuth(null);
  release();
  await settle();
  assert.equal(harness.store.user, null);
  assert.deepEqual(harness.store.watchlist, []);
  assert.equal(harness.store.libraryLoading, false);
});
