import { getFirestore } from "firebase/firestore";
import { app } from "./index.js";
export { getDoc, doc, runTransaction } from "firebase/firestore";
export const firestore = getFirestore(app);
