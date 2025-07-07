"use client"

import { useEffect, useState } from "react"
import { fetchPopularItems, type MenuItem } from "@/lib/menu-data"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { useUserPreferences } from "@/components/user-preferences-provider"
import { Star, Loader2 } from "lucide-react"

export default function FeaturedDishes() {
  const { addItem } = useCart()
  const { toast } = useToast()
  const { preferences } = useUserPreferences()
  const [recommendedItems, setRecommendedItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAndFilterItems() {
      try {
        setLoading(true)
        // Fetch popular items from Firebase
        const popularItems = await fetchPopularItems(10) // Get more items to filter from

        // Filter items based on user preferences
        let filtered = [...popularItems]

        // Apply dietary preferences
        if (preferences.vegetarian) {
          filtered = filtered.filter((item) => item.dietary?.includes("vegetarian"))
        }

        if (preferences.vegan) {
          filtered = filtered.filter((item) => item.dietary?.includes("vegan"))
        }

        if (preferences.glutenFree) {
          filtered = filtered.filter((item) => item.dietary?.includes("gluten-free"))
        }

        if (preferences.dairyFree) {
          filtered = filtered.filter((item) => item.dietary?.includes("dairy-free"))
        }

        if (preferences.nutFree) {
          filtered = filtered.filter((item) => item.dietary?.includes("nut-free"))
        }

        // Sort by rating
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))

        // Take top 6 items
        setRecommendedItems(filtered.slice(0, 6))
      } catch (error) {
        console.error("Error loading featured dishes:", error)
        toast({
          title: "Error",
          description: "Failed to load featured dishes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAndFilterItems()
  }, [preferences, toast])

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
        <p className="text-muted-foreground">Loading recommended dishes...</p>
      </div>
    )
  }

  if (recommendedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No recommendations available</h2>
        <p className="text-muted-foreground">Try adjusting your preferences to see personalized recommendations.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendedItems.map((item) => (
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
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="font-bold">${item.price.toFixed(2)}</div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button className="w-full" onClick={() => handleAddToCart(item)}>
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
