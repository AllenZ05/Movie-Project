import { defineStore } from "pinia";
import { toRaw } from "vue";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getLibraryServices } from "../firebase/libraryLoader.js";
import { commitLibraryChange } from "../lib/library.js";
import { mediaKey } from "../lib/media.js";

const sessions = new WeakMap();
let nextToastId = 1;
const sessionFor = (store) => {
  // Pinia devtools wrap each action in a fresh proxy. Use the stable state as the key.
  const key = toRaw(store.$state);
  if (!sessions.has(key)) sessions.set(key, { authPromise: null, queue: Promise.resolve(), epoch: 0 });
  return sessions.get(key);
};

export const useStore = defineStore("store", {
  state: () => ({
    user: null,
    watchlist: [],
    watchHistory: [],
    authReady: false,
    libraryLoading: false,
    libraryError: false,
    pendingWrites: 0,
    toasts: [],
  }),
  getters: {
    watchlistCount: (state) => state.watchlist.length,
    isLoggedIn: (state) => !!state.user,
    libraryBusy: (state) => state.libraryLoading || state.pendingWrites > 0,
    isSaved: (state) => (item) => state.watchlist.some((movie) => mediaKey(movie) === mediaKey(item)),
    isWatched: (state) => (item) => state.watchHistory.some((movie) => mediaKey(movie) === mediaKey(item)),
  },
  actions: {
    initAuth() {
      const session = sessionFor(this);
      if (!session.authPromise) {
        session.authPromise = new Promise((resolve) => {
          onAuthStateChanged(
            auth,
            (user) => {
              this.setSession(user);
              resolve();
            },
            () => {
              this.authReady = true;
              this.addToast("Sign-in is unavailable. You can still explore movies.", "error");
              resolve();
            }
          );
        });
      }
      return session.authPromise;
    },
    setSession(user) {
      if (this.authReady && this.user?.uid === user?.uid) return;
      sessionFor(this).epoch++;
      this.user = user;
      this.watchlist = [];
      this.watchHistory = [];
      this.libraryError = false;
      this.authReady = true;
      if (user) this.loadLibrary();
      else this.libraryLoading = false;
    },
    async loadLibrary() {
      if (!this.user?.email) return;
      const session = sessionFor(this);
      const epoch = session.epoch;
      const email = this.user.email;
      this.libraryLoading = true;
      this.libraryError = false;
      try {
        const { getDoc, doc, firestore } = await getLibraryServices();
        const [list, history] = await Promise.all([
          getDoc(doc(firestore, "watchlists", email)),
          getDoc(doc(firestore, "watchHistory", email)),
        ]);
        if (epoch !== session.epoch) return;
        const movies = list.exists() ? list.data().movies : [];
        const watched = history.exists() ? history.data().watched : [];
        if (!Array.isArray(movies) || !Array.isArray(watched)) throw new Error("Invalid library data");
        this.watchlist = movies;
        this.watchHistory = watched;
      } catch {
        if (epoch === session.epoch) this.libraryError = true;
      } finally {
        if (epoch === session.epoch) this.libraryLoading = false;
      }
    },
    async changeLibrary(command) {
      if (!this.user?.email || this.libraryLoading || this.libraryError) return null;
      const session = sessionFor(this);
      const epoch = session.epoch;
      const email = this.user.email;
      this.pendingWrites++;
      const task = session.queue.then(async () => {
        const { doc, firestore, runTransaction } = await getLibraryServices();
        if (epoch !== session.epoch || this.user?.email !== email) return null;
        const refs = {
          movies: doc(firestore, "watchlists", email),
          watched: doc(firestore, "watchHistory", email),
        };
        const next = await runTransaction(firestore, (transaction) =>
          commitLibraryChange(transaction, refs, command)
        );
        if (epoch !== session.epoch) return null;
        this.watchlist = next.movies;
        this.watchHistory = next.watched;
        return next.result;
      });
      session.queue = task.catch(() => {});
      try {
        return await task;
      } catch {
        if (epoch === session.epoch)
          this.addToast("Your change couldn’t be saved. Please try again.", "error");
        return null;
      } finally {
        this.pendingWrites--;
      }
    },
    addToWatchlist(item) {
      return this.changeLibrary({ kind: "add", item });
    },
    async removeFromWatchlist(item) {
      const removed = await this.changeLibrary({ kind: "remove", item });
      if (removed)
        this.addToast(`Removed “${removed.item.title}”`, "success", () =>
          this.restoreItem("movies", removed)
        );
      return !!removed;
    },
    async markWatched(item) {
      const entry = await this.changeLibrary({
        kind: "watch",
        item,
        watchedAt: new Date().toISOString(),
        entryId: crypto.randomUUID(),
      });
      if (entry) this.addToast(`Marked “${entry.title}” as watched`);
      return entry;
    },
    async removeFromHistory(item) {
      const removed = await this.changeLibrary({ kind: "unwatch", item });
      if (removed)
        this.addToast(`Removed “${removed.item.title}”`, "success", () =>
          this.restoreItem("watched", removed)
        );
      return !!removed;
    },
    async restoreItem(collection, removed) {
      const restored = await this.changeLibrary({ kind: "restore", collection, ...removed });
      if (restored) this.addToast("Restored to your library");
    },
    setRating(item, rating) {
      return this.changeLibrary({ kind: "rate", item, rating });
    },
    async logout() {
      try {
        await signOut(auth);
        return true;
      } catch {
        this.addToast("Couldn’t sign out. Please try again.", "error");
        return false;
      }
    },
    addToast(message, type = "success", action = null) {
      const id = nextToastId++;
      const email = this.user?.email;
      this.toasts.push({
        id,
        message,
        type,
        action: action ? () => this.user?.email === email && action() : null,
      });
      // Undo stays available until explicitly dismissed.
      if (!action) setTimeout(() => this.dismissToast(id), 5000);
      if (this.toasts.length > 4) this.toasts.shift();
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },
  },
});
