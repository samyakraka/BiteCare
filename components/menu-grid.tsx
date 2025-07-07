"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { fetchMenuItems, type MenuItem } from "@/lib/menu-data"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { Info, Star, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function MenuGrid() {
  const searchParams = useSearchParams()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  // Get filters from URL
  const category = searchParams.get("category") || ""
  const dietaryFilters = searchParams.getAll("dietary") || []
  const priceRange = searchParams.get("price") || ""

  // Fetch menu items from Firebase
  useEffect(() => {
    async function loadMenuItems() {
      try {
        setLoading(true)
        // Fetch all items - we'll filter them client-side for more flexibility
        const items = await fetchMenuItems()
        setMenuItems(items)
      } catch (error) {
        console.error("Error loading menu items:", error)
        toast({
          title: "Error",
          description: "Failed to load menu items",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadMenuItems()
  }, [toast])

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    // Filter by category
    if (category && item.category !== category) {
      return false
    }

    // Filter by dietary preferences
    if (dietaryFilters.length > 0) {
      const matchesDietary = dietaryFilters.every((filter) => item.dietary?.includes(filter))
      if (!matchesDietary) {
        return false
      }
    }

    // Filter by price range
    if (priceRange) {
      if (priceRange === "under-10" && item.price >= 10) {
        return false
      } else if (priceRange === "10-20" && (item.price < 10 || item.price >= 20)) {
        return false
      } else if (priceRange === "20-30" && (item.price < 20 || item.price >= 30)) {
        return false
      } else if (priceRange === "over-30" && item.price < 30) {
        return false
      }
    }

    return true
  })

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      description: item.description,
    })

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading menu items...</p>
      </div>
    )
  }

  return (
    <div>
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No items found</h2>
          <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={item.image || "/placeholder.svg?height=200&width=300"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                {item.popular && <Badge className="absolute top-2 right-2 bg-primary">Popular</Badge>}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.name}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.dietary?.map((tag) => (
                    <TooltipProvider key={tag}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{`This dish is ${tag}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">${item.price.toFixed(2)}</span>
                  {item.calories && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Info className="h-3 w-3 mr-1" />
                      {item.calories} cal
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => handleAddToCart(item)}>
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
