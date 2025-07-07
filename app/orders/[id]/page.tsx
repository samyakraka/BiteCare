"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, ChefHat, Clock, MapPin, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import SignInModal from "@/components/sign-in-modal"

const ORDER_STATUSES = [
  { id: "received", label: "Order Received", icon: ShoppingBag },
  { id: "preparing", label: "Preparing", icon: ChefHat },
  { id: "ready", label: "Ready for Pickup", icon: CheckCircle2 },
  { id: "delivered", label: "Delivered", icon: MapPin },
]

export default function OrderPage({ params }: { params: { id: string } }) {
  const [currentStatus, setCurrentStatus] = useState("received")
  const [progress, setProgress] = useState(25)
  const [estimatedTime, setEstimatedTime] = useState(25)

  const { user } = useAuth()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signInModalOpen, setSignInModalOpen] = useState(false)

  // Simulate order progress
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStatus === "received") {
        setCurrentStatus("preparing")
        setProgress(50)
        setEstimatedTime(15)
      } else if (currentStatus === "preparing") {
        setCurrentStatus("ready")
        setProgress(75)
        setEstimatedTime(5)
      } else if (currentStatus === "ready") {
        setCurrentStatus("delivered")
        setProgress(100)
        setEstimatedTime(0)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [currentStatus])

  // Simulate countdown
  useEffect(() => {
    if (estimatedTime <= 0) return

    const interval = setInterval(() => {
      setEstimatedTime((prev) => Math.max(0, prev - 1))
    }, 60000)

    return () => clearInterval(interval)
  }, [estimatedTime])

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        const orderRef = doc(db, "orders", params.id)
        const orderSnap = await getDoc(orderRef)

        if (orderSnap.exists()) {
          const orderData = {
            id: orderSnap.id,
            ...orderSnap.data(),
            createdAt: orderSnap.data().createdAt?.toDate() || new Date(),
          }
          setOrder(orderData)
        } else {
          toast({
            title: "Order not found",
            description: "The order you're looking for doesn't exist.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error fetching order",
          description: "Could not load order details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrder()
    } else {
      setLoading(false)
    }
  }, [params.id, user, toast])

  const currentStatusIndex = ORDER_STATUSES.findIndex((status) => status.id === currentStatus)

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to view order details</h1>
          <p className="text-muted-foreground mb-8">Please sign in to access your order information.</p>
          <Button onClick={() => setSignInModalOpen(true)}>Sign In</Button>
          <SignInModal
            open={signInModalOpen}
            onOpenChange={setSignInModalOpen}
            redirectAfterSignIn={`/orders/${params.id}`}
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Loading order details...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Order #{params.id}</h1>
        <p className="text-muted-foreground mb-8">Track your order in real-time</p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>
              {estimatedTime > 0 ? `Estimated time: ${estimatedTime} minutes` : "Your order has been delivered!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 mb-6" />

            <div className="grid grid-cols-4 gap-2">
              {ORDER_STATUSES.map((status, index) => {
                const Icon = status.icon
                const isActive = index <= currentStatusIndex
                return (
                  <div key={status.id} className="flex flex-col items-center text-center">
                    <div
                      className={`p-3 rounded-full mb-2 ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-sm ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Margherita Pizza x1</span>
                    <span>$12.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Caesar Salad x1</span>
                    <span>$8.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Garlic Bread x1</span>
                    <span>$4.99</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Payment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>$26.97</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$2.70</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>$3.99</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>$33.66</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Delivery Address</h3>
                <p>123 Main Street, Apt 4B</p>
                <p>New York, NY 10001</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Order Time</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>March 21, 2025 at 10:15 AM</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/menu">Order Again</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
