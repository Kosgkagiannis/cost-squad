import { initializeApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDBQo_0XGZ-Bi_X1elUY-wUcRH2mLXk7Hs",
  authDomain: "cost-squad.firebaseapp.com",
  projectId: "cost-squad",
  storageBucket: "cost-squad.appspot.com",
  messagingSenderId: "169001597137",
  appId: "1:169001597137:web:f121fbf720e50a44e02df0",
  measurementId: "G-HREH9DZLH5",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

setPersistence(auth, browserSessionPersistence)

export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)
