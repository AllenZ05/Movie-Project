import { defineStore } from "pinia";
import { auth, firestore } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setDoc, updateDoc, getDoc, doc } from "firebase/firestore";

let nextToastId = 1;

export const useStore = defineStore("store", {
  state: () => ({
    user: null,
    cart: [],
    authReady: false,
    toasts: [],
  }),
  getters: {
    cartCount: (state) => state.cart.length,
    isLoggedIn: (state) => !!state.user,
  },
  actions: {
    initAuth() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.user = user;
            try {
              const cartDoc = await getDoc(doc(firestore, "carts", user.email));
              if (cartDoc.exists()) {
                this.cart = cartDoc.data().cart;
              }
            } catch (e) {
              console.error("Failed to load cart:", e);
            }
          } else {
            this.user = null;
            this.cart = [];
          }
          this.authReady = true;
          resolve();
        });
      });
    },
    async addToCart(movieData) {
      const alreadyInCart = this.cart.some((item) => item.id === movieData.id);
      if (alreadyInCart) return "duplicate";

      this.cart.push(movieData);
      try {
        await setDoc(doc(firestore, "carts", this.user.email), { cart: this.cart });
        return "added";
      } catch (e) {
        this.cart.pop();
        this.addToast("Couldn't save to your cart. Please try again.", "error");
        return "error";
      }
    },
    async removeFromCart(index) {
      const [removed] = this.cart.splice(index, 1);
      try {
        await updateDoc(doc(firestore, "carts", this.user.email), { cart: this.cart });
      } catch (e) {
        this.cart.splice(index, 0, removed);
        this.addToast("Couldn't update your cart. Please try again.", "error");
      }
    },
    logout() {
      auth.signOut();
      this.user = null;
      this.cart = [];
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
