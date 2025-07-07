"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { auth, googleProvider, db } from "@/lib/firebase"
import { doc, setDoc, getDoc, serverTimestamp, query, collection, limit, getDocs } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<User | null>
  signInWithEmail: (email: string, password: string) => Promise<User | null>
  createAccount: (name: string, email: string, password: string) => Promise<User | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => null,
  signInWithEmail: async () => null,
  createAccount: async () => null,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Update the createUserDocument function to store more user data and set admin role
  const createUserDocument = async (user: User) => {
    // Store user in Firestore
    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      // Check if this is the first user (make them admin)
      const usersQuery = query(collection(db, "users"), limit(1))
      const usersSnapshot = await getDocs(usersQuery)
      const isFirstUser = usersSnapshot.empty

      // Create new user document if it doesn't exist
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phone: "",
        address: "",
        role: isFirstUser ? "admin" : "user", // First user is admin
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      })
    } else {
      // Update last login
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true })
    }
  }

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      await createUserDocument(user)

      toast({
        title: "Signed in successfully",
        description: `Welcome ${user.displayName || "back"}!`,
      })

      return user
    } catch (error: any) {
      console.error("Error signing in with Google:", error)
      toast({
        title: "Sign in failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive",
      })
      return null
    }
  }

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user

      await createUserDocument(user)

      toast({
        title: "Signed in successfully",
        description: `Welcome back!`,
      })

      return user
    } catch (error: any) {
      console.error("Error signing in with email:", error)
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
      return null
    }
  }

  const createAccount = async (name: string, email: string, password: string): Promise<User | null> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user

      // Update profile with display name
      await updateProfile(user, {
        displayName: name,
      })

      await createUserDocument(user)

      toast({
        title: "Account created successfully",
        description: `Welcome to BiteCare, ${name}!`,
      })

      return user
    } catch (error: any) {
      console.error("Error creating account:", error)
      toast({
        title: "Account creation failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      })
      return null
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth)
      toast({
        title: "Signed out successfully",
      })
    } catch (error: any) {
      console.error("Error signing out:", error)
      toast({
        title: "Sign out failed",
        description: error.message || "Could not sign out",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        createAccount,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
