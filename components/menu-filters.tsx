"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronDown, ChevronUp, Filter } from "lucide-react"
import { useUserPreferences } from "@/components/user-preferences-provider"
import { useRouter, useSearchParams } from "next/navigation"

export default function MenuFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { preferences } = useUserPreferences()
  const [filtersOpen, setFiltersOpen] = useState(true)

  // Get current filters from URL
  const category = searchParams.get("category") || ""
  const dietaryFilters = searchParams.getAll("dietary") || []
  const priceRange = searchParams.get("price") || ""

  // Apply filters
  const applyFilters = (type: "category" | "dietary" | "price", value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (type === "category") {
      if (value === category) {
        params.delete("category")
      } else {
        params.set("category", value)
      }
    } else if (type === "dietary") {
      if (dietaryFilters.includes(value)) {
        // Remove the filter
        const newFilters = dietaryFilters.filter((f) => f !== value)
        params.delete("dietary")
        newFilters.forEach((f) => params.append("dietary", f))
      } else {
        // Add the filter
        params.append("dietary", value)
      }
    } else if (type === "price") {
      if (value === priceRange) {
        params.delete("price")
      } else {
        params.set("price", value)
      }
    }

    router.push(`/menu?${params.toString()}`)
  }

  // Clear all filters
  const clearFilters = () => {
    router.push("/menu")
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={() => setFiltersOpen(!filtersOpen)}>
          {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent>
          <Accordion type="multiple" defaultValue={["categories", "dietary", "price"]}>
            <AccordionItem value="categories">
              <AccordionTrigger>Categories</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {[
                    { id: "appetizers", label: "Appetizers" },
                    { id: "main-courses", label: "Main Courses" },
                    { id: "pizzas", label: "Pizzas" },
                    { id: "pastas", label: "Pastas" },
                    { id: "salads", label: "Salads" },
                    { id: "desserts", label: "Desserts" },
                    { id: "drinks", label: "Drinks" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${item.id}`}
                        checked={category === item.id}
                        onCheckedChange={() => applyFilters("category", item.id)}
                      />
                      <Label htmlFor={`category-${item.id}`} className="text-sm cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dietary">
              <AccordionTrigger>Dietary Preferences</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {[
                    { id: "vegetarian", label: "Vegetarian" },
                    { id: "vegan", label: "Vegan" },
                    { id: "gluten-free", label: "Gluten Free" },
                    { id: "dairy-free", label: "Dairy Free" },
                    { id: "nut-free", label: "Nut Free" },
                    { id: "spicy", label: "Spicy" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dietary-${item.id}`}
                        checked={dietaryFilters.includes(item.id)}
                        onCheckedChange={() => applyFilters("dietary", item.id)}
                      />
                      <Label htmlFor={`dietary-${item.id}`} className="text-sm cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price">
              <AccordionTrigger>Price Range</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {[
                    { id: "under-10", label: "Under $10" },
                    { id: "10-20", label: "$10 - $20" },
                    { id: "20-30", label: "$20 - $30" },
                    { id: "over-30", label: "Over $30" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`price-${item.id}`}
                        checked={priceRange === item.id}
                        onCheckedChange={() => applyFilters("price", item.id)}
                      />
                      <Label htmlFor={`price-${item.id}`} className="text-sm cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator className="my-4" />

          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
