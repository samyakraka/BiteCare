"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { useUserPreferences } from "@/components/user-preferences-provider"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Clock, Gift, History, Star, LogIn, MessageSquare } from "lucide-react"
import Link from "next/link"
import SignInModal from "@/components/sign-in-modal"
import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
})

const dietaryPreferencesSchema = z.object({
  vegetarian: z.boolean().default(false),
  vegan: z.boolean().default(false),
  glutenFree: z.boolean().default(false),
  nutFree: z.boolean().default(false),
  dairyFree: z.boolean().default(false),
  spicy: z.boolean().default(false),
  lowCalorie: z.boolean().default(false),
})

export default function ProfilePage() {
  const { toast } = useToast()
  const { preferences, updatePreferences } = useUserPreferences()
  const { user } = useAuth()
  const [signInModalOpen, setSignInModalOpen] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [loadingChats, setLoadingChats] = useState(true)

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.displayName || "John Doe",
      email: user?.email || "john.doe@example.com",
      phone: "555-123-4567",
      address: "123 Main St, Apt 4B, New York, NY 10001",
    },
  })

  const dietaryForm = useForm<z.infer<typeof dietaryPreferencesSchema>>({
    resolver: zodResolver(dietaryPreferencesSchema),
    defaultValues: preferences,
  })

  // Fetch user orders when user is authenticated
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        setLoading(true)
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const orderData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate().toLocaleDateString() || "Unknown date",
        }))

        setOrders(orderData)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error fetching orders",
          description: "Could not load your order history",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, toast])

  // Add a new useEffect to fetch chat history
  // Add this after the existing useEffect for fetching orders
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return

      try {
        setLoadingChats(true)
        const chatsRef = collection(db, "chatHistory")
        const q = query(chatsRef, where("userId", "==", user.uid), orderBy("timestamp", "desc"))

        const querySnapshot = await getDocs(q)
        const chatsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().timestamp?.toDate().toLocaleDateString() || "Unknown date",
          time: doc.data().timestamp?.toDate().toLocaleTimeString() || "Unknown time",
        }))

        setChatHistory(chatsData)
      } catch (error) {
        console.error("Error fetching chat history:", error)
        toast({
          title: "Error fetching chat history",
          description: "Could not load your chat history",
          variant: "destructive",
        })
      } finally {
        setLoadingChats(false)
      }
    }

    fetchChatHistory()
  }, [user, toast])

  // Fetch user profile data when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      try {
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const userData = userSnap.data()

          // Update form with user data from Firestore
          if (userData.displayName) profileForm.setValue("name", userData.displayName)
          if (userData.email) profileForm.setValue("email", userData.email)
          if (userData.phone) profileForm.setValue("phone", userData.phone)
          if (userData.address) profileForm.setValue("address", userData.address)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Error fetching profile",
          description: "Could not load your profile information",
          variant: "destructive",
        })
      }
    }

    fetchUserProfile()
  }, [user, profileForm, toast])

  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      profileForm.setValue("name", user.displayName || "")
      profileForm.setValue("email", user.email || "")
    }
  }, [user, profileForm])

  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) return

    const updateUserProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid)
        await setDoc(
          userRef,
          {
            displayName: values.name,
            email: values.email,
            phone: values.phone || "",
            address: values.address || "",
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )

        toast({
          title: "Profile updated",
          description: "Your profile information has been updated.",
        })
      } catch (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Update failed",
          description: "Could not update your profile information.",
          variant: "destructive",
        })
      }
    }

    updateUserProfile()
  }

  function onDietarySubmit(values: z.infer<typeof dietaryPreferencesSchema>) {
    updatePreferences(values)
    toast({
      title: "Preferences updated",
      description: "Your dietary preferences have been updated.",
    })
  }

  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to view your profile</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to access your profile, order history, and preferences.
          </p>
          <Button onClick={() => setSignInModalOpen(true)} className="gap-2">
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
          <SignInModal
            open={signInModalOpen}
            onOpenChange={setSignInModalOpen}
            message="Sign in to access your profile"
            redirectAfterSignIn="/profile"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="chats">Chat History</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and delivery address.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>Set your dietary preferences to get personalized recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...dietaryForm}>
                <form onSubmit={dietaryForm.handleSubmit(onDietarySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={dietaryForm.control}
                      name="vegetarian"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Vegetarian</FormLabel>
                            <FormDescription>No meat, but may include dairy and eggs</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dietaryForm.control}
                      name="vegan"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Vegan</FormLabel>
                            <FormDescription>No animal products whatsoever</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dietaryForm.control}
                      name="glutenFree"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Gluten Free</FormLabel>
                            <FormDescription>No wheat, barley, or rye products</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dietaryForm.control}
                      name="nutFree"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Nut Free</FormLabel>
                            <FormDescription>No peanuts or tree nuts</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dietaryForm.control}
                      name="dairyFree"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Dairy Free</FormLabel>
                            <FormDescription>No milk, cheese, or other dairy products</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={dietaryForm.control}
                      name="spicy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Spicy</FormLabel>
                            <FormDescription>Prefer spicy food options</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">Save Preferences</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past orders and reorder your favorites.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p>You haven't placed any orders yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/menu">Browse Menu</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Order #{order.id.slice(0, 6)}
                          </h3>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                      <div className="text-sm">
                        {order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(", ")}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/orders/${order.id}`}>View Details</Link>
                          </Button>
                          <Button size="sm">Reorder</Button>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chats">
          <Card>
            <CardHeader>
              <CardTitle>Chat History</CardTitle>
              <CardDescription>View your previous conversations with our AI assistant.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingChats ? (
                <div className="text-center py-8">
                  <p>Loading your chat history...</p>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p>You haven't had any conversations with our AI assistant yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/menu">Start a Conversation</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Conversation on {chat.date}
                          </h3>
                          <p className="text-sm text-muted-foreground">{chat.time}</p>
                        </div>
                        <Badge>{chat.messages.length} messages</Badge>
                      </div>
                      <div className="bg-muted p-4 rounded-md max-h-40 overflow-y-auto">
                        {chat.messages.slice(0, 3).map((message: any, index: number) => (
                          <div key={index} className="mb-2">
                            <span className={`font-semibold ${message.role === "user" ? "text-primary" : ""}`}>
                              {message.role === "user" ? "You: " : "AI: "}
                            </span>
                            <span className="text-sm">
                              {message.content.substring(0, 100)}
                              {message.content.length > 100 ? "..." : ""}
                            </span>
                          </div>
                        ))}
                        {chat.messages.length > 3 && (
                          <p className="text-sm text-muted-foreground italic">
                            + {chat.messages.length - 3} more messages
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/chat/${chat.id}`}>View Full Conversation</Link>
                        </Button>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Rewards</CardTitle>
              <CardDescription>Track your points and redeem rewards.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="bg-primary/10 p-6 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary text-primary-foreground p-3 rounded-full">
                      <Star className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">350 Points</h3>
                      <p className="text-sm text-muted-foreground">You're 150 points away from your next reward</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Available Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Free Dessert",
                        points: 200,
                        expires: "April 30, 2025",
                        icon: Gift,
                      },
                      {
                        title: "10% Off Next Order",
                        points: 300,
                        expires: "May 15, 2025",
                        icon: Gift,
                      },
                      {
                        title: "Free Delivery",
                        points: 250,
                        expires: "April 15, 2025",
                        icon: Gift,
                      },
                      {
                        title: "Buy One Get One Free",
                        points: 500,
                        expires: "June 1, 2025",
                        icon: Gift,
                      },
                    ].map((reward, index) => {
                      const Icon = reward.icon
                      return (
                        <Card key={index} className="overflow-hidden">
                          <div className="bg-primary/10 p-4 flex items-center gap-3">
                            <Icon className="h-5 w-5 text-primary" />
                            <h4 className="font-medium">{reward.title}</h4>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">{reward.points} points</span>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Expires: {reward.expires}
                              </div>
                            </div>
                            <Button variant="outline" className="w-full" disabled={350 < reward.points}>
                              {350 >= reward.points ? "Redeem Reward" : `Need ${reward.points - 350} more points`}
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      {
                        action: "Order #123",
                        points: "+35 points",
                        date: "March 21, 2025",
                      },
                      {
                        action: "Order #122",
                        points: "+30 points",
                        date: "March 18, 2025",
                      },
                      {
                        action: "Redeemed Free Delivery",
                        points: "-250 points",
                        date: "March 15, 2025",
                      },
                      {
                        action: "Order #121",
                        points: "+25 points",
                        date: "March 12, 2025",
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                        <Badge variant={activity.points.startsWith("+") ? "default" : "secondary"}>
                          {activity.points}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
