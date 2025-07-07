"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Preferences = {
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  nutFree: boolean
  dairyFree: boolean
  spicy: boolean
  lowCalorie: boolean
}

type UserPreferencesContextType = {
  preferences: Preferences
  updatePreferences: (newPreferences: Preferences) => void
}

const defaultPreferences: Preferences = {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  nutFree: false,
  dairyFree: false,
  spicy: false,
  lowCalorie: false,
}

const UserPreferencesContext = createContext<UserPreferencesContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
})

export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem("userPreferences")
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (error) {
        console.error("Failed to parse preferences from localStorage:", error)
      }
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences))
  }, [preferences])

  const updatePreferences = (newPreferences: Preferences) => {
    setPreferences(newPreferences)
  }

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export const useUserPreferences = () => useContext(UserPreferencesContext)
