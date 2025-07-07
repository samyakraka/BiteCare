import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1H_TMv1o80UAwh8BBMdVl-l4PJT7oCzs",
  authDomain: "bitecare-11.firebaseapp.com",
  projectId: "bitecare-11",
  storageBucket: "bitecare-11.firebasestorage.app",
  messagingSenderId: "55612589942",
  appId: "1:55612589942:web:9f81b6a8e4758a4d6a5c57",
  measurementId: "G-X49J7Z14J2",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Initialize Analytics conditionally (only in browser)
const initializeAnalytics = async () => {
  if (typeof window !== "undefined") {
    const analyticsSupported = await isSupported()
    if (analyticsSupported) {
      return getAnalytics(app)
    }
  }
  return null
}

export { app, db, auth, googleProvider, initializeAnalytics }
