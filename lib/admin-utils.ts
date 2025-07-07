import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

// Function to check if a user is an admin
export async function isUserAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false

  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      return userData.role === "admin"
    }

    return false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
