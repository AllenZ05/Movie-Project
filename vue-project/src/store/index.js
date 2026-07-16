import { defineStore } from "pinia";
import { auth, firestore } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setDoc, getDoc, doc } from "firebase/firestore";

let nextToastId = 1;

export const useStore = defineStore("store", {
  state: () => ({
    user: null,
    watchlist: [],
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
              const listDoc = await getDoc(doc(firestore, "watchlists", user.email));
              if (listDoc.exists()) {
                this.watchlist = listDoc.data().movies;
              }
            } catch (e) {
              console.error("Failed to load watchlist:", e);
            }
          } else {
            this.user = null;
            this.watchlist = [];
          }
          this.authReady = true;
          resolve();
        });
      });
    },
    async addToWatchlist(movieData) {
      const alreadySaved = this.watchlist.some((item) => item.id === movieData.id);
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
      } catch (e) {
        this.watchlist.splice(index, 0, removed);
        this.addToast("Couldn't update your watchlist. Please try again.", "error");
      }
    },
    async markWatched(index) {
      const [movie] = this.watchlist.splice(index, 1);
      try {
        const historyRef = doc(firestore, "watchHistory", this.user.email);
        const snapshot = await getDoc(historyRef);
        const watched = snapshot.exists() ? snapshot.data().watched : [];
        watched.push({
          id: movie.id,
          title: movie.title,
          poster: movie.poster || null,
          watchedAt: new Date().toISOString(),
        });
        await setDoc(historyRef, { watched });
        await setDoc(doc(firestore, "watchlists", this.user.email), { movies: this.watchlist });
        return movie;
      } catch (e) {
        this.watchlist.splice(index, 0, movie);
        this.addToast("Couldn't mark as watched. Please try again.", "error");
        return null;
      }
    },
    logout() {
      auth.signOut();
      this.user = null;
      this.watchlist = [];
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
