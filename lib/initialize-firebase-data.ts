import { collection, addDoc, serverTimestamp, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { menuItems } from "@/lib/menu-data"

/**
 * Initializes the menu data in Firebase Firestore
 * @returns Promise with the number of items added
 */
export async function initializeMenuData(): Promise<number> {
  // Check if menu items already exist
  const menuItemsQuery = query(collection(db, "menuItems"), limit(1))
  const querySnapshot = await getDocs(menuItemsQuery)

  if (!querySnapshot.empty) {
    // Menu items already exist
    console.log("Menu items already exist in Firestore")
    return 0
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

  console.log(`Added ${addedCount} menu items to Firestore`)
  return addedCount
}

/**
 * Checks if menu data exists in Firebase
 * @returns Promise<boolean> - true if menu data exists
 */
export async function menuDataExists(): Promise<boolean> {
  const menuItemsQuery = query(collection(db, "menuItems"), limit(1))
  const querySnapshot = await getDocs(menuItemsQuery)
  return !querySnapshot.empty
}
