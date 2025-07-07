import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
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
