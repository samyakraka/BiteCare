import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"

// Define the MenuItem type
export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  dietary?: string[]
  popular?: boolean
  rating?: number
  calories?: number
}

// Static menu items as fallback
export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    price: 12.99,
    category: "pizzas",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pizza_Margherita_stu_spivack.jpg/500px-Pizza_Margherita_stu_spivack.jpg",
    dietary: ["vegetarian"],
    popular: true,
    rating: 4.8,
    calories: 850,
  },
  {
    id: "2",
    name: "Pepperoni Pizza",
    description: "Traditional pizza topped with pepperoni slices",
    price: 14.99,
    category: "pizzas",
    image: "https://cdn.pixabay.com/photo/2017/08/02/12/38/pepperoni-2571392_1280.jpg",
    popular: true,
    rating: 4.7,
    calories: 950,
  },
  {
    id: "3",
    name: "Vegetarian Pizza",
    description: "Pizza topped with bell peppers, mushrooms, onions, and olives",
    price: 13.99,
    category: "pizzas",
    image:
      "https://www.thursdaynightpizza.com/wp-content/uploads/2022/06/veggie-pizza-side-view-out-of-oven-720x480.png",
    dietary: ["vegetarian"],
    rating: 4.5,
    calories: 800,
  },
  {
    id: "4",
    name: "Caesar Salad",
    description: "Romaine lettuce, croutons, parmesan cheese with Caesar dressing",
    price: 8.99,
    category: "salads",
    image: "https://feelgoodfoodie.net/wp-content/uploads/2020/04/Caesar-Salad-06.jpg",
    dietary: ["vegetarian"],
    rating: 4.6,
    calories: 350,
  },
  {
    id: "5",
    name: "Greek Salad",
    description: "Tomatoes, cucumbers, olives, feta cheese with olive oil dressing",
    price: 9.99,
    category: "salads",
    image:
      "https://www.spendwithpennies.com/wp-content/uploads/2023/08/Greek-Salad-SpendWithPennies-23-101-1024x1536.jpg",
    dietary: ["vegetarian", "gluten-free"],
    rating: 4.4,
    calories: 320,
  },
  {
    id: "6",
    name: "Spaghetti Bolognese",
    description: "Spaghetti pasta with rich meat sauce and parmesan cheese",
    price: 15.99,
    category: "pastas",
    image: "https://umamiology.com/wp-content/uploads/2024/04/Umamiology-Spaghetti-Bolognese-BeautyShot3-1152x1536.jpg",
    rating: 4.7,
    calories: 780,
  },
  {
    id: "7",
    name: "Fettuccine Alfredo",
    description: "Fettuccine pasta in creamy Alfredo sauce with parmesan",
    price: 14.99,
    category: "pastas",
    image: "https://img.freepik.com/free-photo/delicious-pasta-plate_23-2150690687.jpg",
    dietary: ["vegetarian"],
    rating: 4.6,
    calories: 950,
  },
  {
    id: "8",
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter and herbs",
    price: 4.99,
    category: "appetizers",
    image: "https://cdn.uengage.io/uploads/5/image-197794-1715671346.png",
    dietary: ["vegetarian"],
    popular: true,
    rating: 4.5,
    calories: 320,
  },
  {
    id: "9",
    name: "Mozzarella Sticks",
    description: "Breaded and fried mozzarella cheese sticks with marinara sauce",
    price: 7.99,
    category: "appetizers",
    image: "https://allshecooks.com/wp-content/uploads/2013/10/mozzarella-sticks.jpg",
    dietary: ["vegetarian"],
    rating: 4.4,
    calories: 450,
  },
  {
    id: "10",
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
    price: 6.99,
    category: "desserts",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tiramisu_-_Raffaele_Diomede.jpg/500px-Tiramisu_-_Raffaele_Diomede.jpg",
    dietary: ["vegetarian"],
    popular: true,
    rating: 4.9,
    calories: 420,
  },
  {
    id: "11",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten chocolate center",
    price: 7.99,
    category: "desserts",
    image:
      "https://www.hersheyland.com/content/dam/hersheyland/en-us/recipes/recipe-images/505-brownie-lava-cake-cropped.png?im=Resize=(1920)",
    dietary: ["vegetarian"],
    rating: 4.8,
    calories: 550,
  },
  {
    id: "12",
    name: "Grilled Salmon",
    description: "Fresh salmon fillet grilled with lemon and herbs",
    price: 18.99,
    category: "main-courses",
    image: "https://www.budgetbytes.com/wp-content/uploads/2024/06/Grilled-Salmon-V4-1152x1536.jpg",
    dietary: ["gluten-free"],
    rating: 4.7,
    calories: 480,
  },
  {
    id: "13",
    name: "Chicken Parmesan",
    description: "Breaded chicken breast topped with marinara and mozzarella",
    price: 16.99,
    category: "main-courses",
    image: "https://imhungryforthat.com/wp-content/uploads/2022/04/olive-garden-chicken-parmesan-recipe.jpg.webp",
    popular: true,
    rating: 4.6,
    calories: 850,
  },
  {
    id: "14",
    name: "Veggie Burger",
    description: "Plant-based patty with lettuce, tomato, and special sauce",
    price: 13.99,
    category: "main-courses",
    image: "https://www.madhuseverydayindian.com/wp-content/uploads/2022/02/veggie-burger-indian-recipe-1024x1536.jpg",
    dietary: ["vegetarian", "vegan"],
    rating: 4.4,
    calories: 580,
  },
  {
    id: "15",
    name: "Mushroom Risotto",
    description: "Creamy Arborio rice with mushrooms and parmesan",
    price: 15.99,
    category: "main-courses",
    image: "https://www.themediterraneandish.com/wp-content/uploads/2023/05/TMD-Mushroom-Risotto-WEB-7.jpg",
    dietary: ["vegetarian", "gluten-free"],
    rating: 4.5,
    calories: 620,
  },
]

// Function to fetch menu items from Firebase
export async function fetchMenuItems(categoryFilter?: string): Promise<MenuItem[]> {
  try {
    let menuItemsQuery

    if (categoryFilter) {
      // If category filter is provided, query items by category
      menuItemsQuery = query(collection(db, "menuItems"), where("category", "==", categoryFilter))
    } else {
      // Otherwise, get all menu items
      menuItemsQuery = query(collection(db, "menuItems"))
    }

    const querySnapshot = await getDocs(menuItemsQuery)

    if (querySnapshot.empty) {
      console.log("No menu items found in Firestore, using static data")
      // If category filter is provided, filter the static data
      return categoryFilter ? menuItems.filter((item) => item.category === categoryFilter) : menuItems
    }

    const menuItemsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[]

    // If category filter is provided, no need to sort
    // Otherwise, sort by category and name
    if (!categoryFilter) {
      menuItemsData.sort((a, b) => {
        // First compare categories
        if (a.category < b.category) return -1
        if (a.category > b.category) return 1

        // If categories are the same, compare names
        return a.name.localeCompare(b.name)
      })
    }

    return menuItemsData
  } catch (error) {
    console.error("Error fetching menu items:", error)
    // Return filtered static data as fallback
    return categoryFilter ? menuItems.filter((item) => item.category === categoryFilter) : menuItems
  }
}

// Function to fetch a single menu item by ID
export async function fetchMenuItemById(id: string): Promise<MenuItem | null> {
  try {
    const docRef = doc(db, "menuItems", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as MenuItem
    } else {
      // If not found in Firebase, try to find in static data
      const staticItem = menuItems.find((item) => item.id === id)
      return staticItem || null
    }
  } catch (error) {
    console.error("Error fetching menu item:", error)
    // Try to find in static data as fallback
    const staticItem = menuItems.find((item) => item.id === id)
    return staticItem || null
  }
}

// Function to fetch popular menu items
export async function fetchPopularItems(limit = 6): Promise<MenuItem[]> {
  try {
    // Only filter by popular, don't use compound ordering
    const popularQuery = query(collection(db, "menuItems"), where("popular", "==", true))

    const querySnapshot = await getDocs(popularQuery)

    if (querySnapshot.empty) {
      console.log("No popular items found in Firestore, using static data")
      return menuItems.filter((item) => item.popular).slice(0, limit)
    }

    const popularItems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[]

    // Sort client-side by rating and name
    popularItems.sort((a, b) => {
      // First by rating (descending)
      const ratingA = a.rating || 0
      const ratingB = b.rating || 0
      if (ratingB !== ratingA) {
        return ratingB - ratingA
      }

      // Then by name if ratings are equal
      return a.name.localeCompare(b.name)
    })

    return popularItems.slice(0, limit)
  } catch (error) {
    console.error("Error fetching popular items:", error)
    return menuItems.filter((item) => item.popular).slice(0, limit)
  }
}
