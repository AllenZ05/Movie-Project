import { defineStore } from "pinia";
import { auth, firestore } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setDoc, getDoc, doc } from "firebase/firestore";

let nextToastId = 1;

export const useStore = defineStore("store", {
  state: () => ({
    user: null,
    watchlist: [],
    watchHistory: [],
    authReady: false,
    toasts: [],
  }),
  getters: {
    watchlistCount: (state) => state.watchlist.length,
    isLoggedIn: (state) => !!state.user,
  },
  actions: {
    initAuth() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.user = user;
            try {
              const [listDoc, historyDoc] = await Promise.all([
                getDoc(doc(firestore, "watchlists", user.email)),
                getDoc(doc(firestore, "watchHistory", user.email)),
              ]);
              if (listDoc.exists()) {
                this.watchlist = listDoc.data().movies;
              }
              if (historyDoc.exists()) {
                this.watchHistory = historyDoc.data().watched;
              }
            } catch (e) {
              console.error("Failed to load user data:", e);
            }
          } else {
            this.user = null;
            this.watchlist = [];
            this.watchHistory = [];
          }
          this.authReady = true;
          resolve();
        });
      });
    },
    async addToWatchlist(movieData) {
      // Movie and TV ids can collide, so match on both id and media type
      const alreadySaved = this.watchlist.some(
        (item) => item.id === movieData.id && (item.media_type || "movie") === (movieData.media_type || "movie"),
      );
      if (alreadySaved) return "duplicate";

      this.watchlist.push(movieData);
      try {
        await setDoc(doc(firestore, "watchlists", this.user.email), { movies: this.watchlist });
        return "added";
      } catch (e) {
        this.watchlist.pop();
        this.addToast("Couldn't save to your watchlist. Please try again.", "error");
        return "error";
      }
    },
    async removeFromWatchlist(index) {
      const [removed] = this.watchlist.splice(index, 1);
      try {
        await setDoc(doc(firestore, "watchlists", this.user.email), { movies: this.watchlist });
        return true;
      } catch (e) {
        this.watchlist.splice(index, 0, removed);
        this.addToast("Couldn't update your watchlist. Please try again.", "error");
        return false;
      }
    },
    async markWatched(index) {
      const [movie] = this.watchlist.splice(index, 1);
      const entry = {
        id: movie.id,
        media_type: movie.media_type || "movie",
        title: movie.title,
        poster: movie.poster || null,
        watchedAt: new Date().toISOString(),
        rating: null,
      };
      this.watchHistory.push(entry);
      try {
        await setDoc(doc(firestore, "watchHistory", this.user.email), { watched: this.watchHistory });
        await setDoc(doc(firestore, "watchlists", this.user.email), { movies: this.watchlist });
        return entry;
      } catch (e) {
        this.watchHistory.pop();
        this.watchlist.splice(index, 0, movie);
        this.addToast("Couldn't mark as watched. Please try again.", "error");
        return null;
      }
    },
    async removeFromHistory(item) {
      const index = this.watchHistory.indexOf(item);
      if (index === -1) return false;
      this.watchHistory.splice(index, 1);
      try {
        await setDoc(doc(firestore, "watchHistory", this.user.email), { watched: this.watchHistory });
        return true;
      } catch (e) {
        this.watchHistory.splice(index, 0, item);
        this.addToast("Couldn't update your history. Please try again.", "error");
        return false;
      }
    },
    async setRating(item, rating) {
      const previous = item.rating ?? null;
      // Clicking your current rating clears it
      item.rating = rating === previous ? null : rating;
      try {
        await setDoc(doc(firestore, "watchHistory", this.user.email), { watched: this.watchHistory });
      } catch (e) {
        item.rating = previous;
        this.addToast("Couldn't save your rating. Please try again.", "error");
      }
    },
    logout() {
      auth.signOut();
      this.user = null;
      this.watchlist = [];
      this.watchHistory = [];
    },
    addToast(message, type = "success") {
      const id = nextToastId++;
      this.toasts.push({ id, message, type });
      setTimeout(() => this.dismissToast(id), 4000);
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },
  },
});
