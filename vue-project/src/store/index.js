import { defineStore } from "pinia";
import { auth, firestore } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setDoc, updateDoc, getDoc, doc } from "firebase/firestore";

export const useStore = defineStore("store", {
  state: () => ({
    user: null,
    cart: [],
    authReady: false,
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
      if (alreadyInCart) return false;

      this.cart.push(movieData);
      await setDoc(doc(firestore, "carts", this.user.email), { cart: this.cart });
      return true;
    },
    async removeFromCart(index) {
      this.cart.splice(index, 1);
      await updateDoc(doc(firestore, "carts", this.user.email), { cart: this.cart });
    },
    logout() {
      auth.signOut();
      this.user = null;
      this.cart = [];
    },
  },
});
