"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, getDocs, query, limit } from "firebase/firestore"
import { menuItems } from "@/lib/menu-data"
import { Loader2, Check } from "lucide-react"

export default function InitializeMenuData() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { toast } = useToast()

  const handleInitializeMenu = async () => {
    if (!confirm("This will add sample menu items to your database. Continue?")) {
      return
    }

    setIsInitializing(true)
    setIsComplete(false)

    try {
      // Check if menu items already exist
      const menuItemsQuery = query(collection(db, "menuItems"), limit(1))
      const querySnapshot = await getDocs(menuItemsQuery)

      if (!querySnapshot.empty) {
        if (!confirm("Menu items already exist in the database. Do you want to add more sample items?")) {
          setIsInitializing(false)
          return
        }
      }

      // Add each menu item to Firestore
      const menuItemsCollection = collection(db, "menuItems")
      let addedCount = 0

      for (const item of menuItems) {
        // Create a new document with a generated ID
        await addDoc(menuItemsCollection, {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        addedCount++
      }

      setIsComplete(true)
      toast({
        title: "Success",
        description: `${addedCount} menu items have been added to your database.`,
      })
    } catch (error) {
      console.error("Error initializing menu data:", error)
      toast({
        title: "Error",
        description: "Failed to initialize menu data. " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Button onClick={handleInitializeMenu} disabled={isInitializing} className="w-full">
      {isInitializing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initializing Menu Data...
        </>
      ) : isComplete ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Menu Data Initialized
        </>
      ) : (
        "Initialize Menu Data"
      )}
    </Button>
  )
}
