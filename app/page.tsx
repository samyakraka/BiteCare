import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, Star, Utensils, AppleIcon } from "lucide-react"
import FeaturedDishes from "@/components/featured-dishes"
import CategoryCards from "@/components/category-cards"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative mb-16">
        <div className="rounded-xl overflow-hidden border shadow-lg">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-gradient-to-br from-primary/10 to-primary/30 z-10">
              <div className="flex items-center mb-6">
                <div className="bg-primary rounded-full p-2 mr-3">
                  <AppleIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-primary">BiteCare</h2>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Your Taste, <br />
                Our Passion
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-md">
                Discover culinary excellence with personalized service. Order fresh meals, explore our menu, and
                experience the taste difference in every bite.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/menu">Order Now</Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/menu">Explore Menu</Link>
                </Button>
              </div>
            </div>

            <div className="w-full lg:w-1/2 relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-pCgtdauv5vhLzhPEFETVhgJTo2Rk0i.png"
                alt="BiteCare staff ready to serve you"
                width={800}
                height={600}
                className="w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Commitment To You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                <Utensils className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chef-Crafted Meals</h3>
              <p className="text-muted-foreground">
                Every dish is prepared with care by our expert chefs using only the freshest ingredients.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">On-Time Delivery</h3>
              <p className="text-muted-foreground">
                Track your order from kitchen to your door with accurate time estimates.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Loyalty Rewards</h3>
              <p className="text-muted-foreground">Earn points with every order and receive exclusive offers.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories */}
      <CategoryCards />

      {/* Featured Dishes */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Recommended For You</h2>
          <Button variant="ghost" asChild>
            <Link href="/menu" className="flex items-center gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <FeaturedDishes />
      </section>
    </div>
  )
}
