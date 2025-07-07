import { Suspense } from "react"
import MenuFilters from "@/components/menu-filters"
import MenuGrid from "@/components/menu-grid"
import { Skeleton } from "@/components/ui/skeleton"
import AiChatButton from "@/components/ai-chat-button"
import ImageSearchButton from "@/components/image-search-button"

export default function MenuPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-muted-foreground">Browse our selection or use AI to help you find the perfect dish</p>
        </div>
        <div className="flex gap-2">
          <AiChatButton />
          <ImageSearchButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Suspense fallback={<FiltersSkeleton />}>
            <MenuFilters />
          </Suspense>
        </div>
        <div className="lg:col-span-3">
          <Suspense fallback={<MenuSkeleton />}>
            <MenuGrid />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
    </div>
  )
}
