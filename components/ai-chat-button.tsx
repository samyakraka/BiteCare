"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Bot, Send, X, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { menuItems } from "@/lib/menu-data"
import { Badge } from "@/components/ui/badge"

// Add the import for Firestore operations
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"

export default function AiChatButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { addItem } = useCart()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([{ type: "bot", text: "Welcome to AI Bistro! How can I help you today?" }])
  const [currentOrder, setCurrentOrder] = useState<any[]>([])
  const [orderState, setOrderState] = useState("initial") // initial, recommending, quantity, more, checkout, complete
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [currentQuantity, setCurrentQuantity] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)

  // Add useAuth to the component
  const { user } = useAuth()

  // Add a state for the current chat ID
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  // Calculate total price whenever order changes
  useEffect(() => {
    const total = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalPrice(Number.parseFloat(total.toFixed(2)))
  }, [currentOrder])

  // Filter menu items by category and query
  const getRecommendations = (category: string, query = "") => {
    return menuItems.filter(
      (item) => item.category === category && (query === "" || item.name.toLowerCase().includes(query.toLowerCase())),
    )
  }

  // Process input for intent
  const processInput = (text: string) => {
    const lowerText = text.toLowerCase()

    // Detect category intents
    if (lowerText.includes("pizza")) {
      return { intent: "category", category: "pizzas" }
    } else if (lowerText.includes("salad")) {
      return { intent: "category", category: "salads" }
    } else if (lowerText.includes("pasta")) {
      return { intent: "category", category: "pastas" }
    } else if (lowerText.includes("appetizer") || lowerText.includes("starter")) {
      return { intent: "category", category: "appetizers" }
    } else if (lowerText.includes("dessert")) {
      return { intent: "category", category: "desserts" }
    }

    // Detect item selection
    if (orderState === "recommending") {
      const itemNumber = Number.parseInt(lowerText)
      if (!isNaN(itemNumber) && itemNumber > 0 && itemNumber <= menuItems.length) {
        return { intent: "select_item", itemId: itemNumber.toString() }
      }
    }

    // Detect quantity
    if (orderState === "quantity") {
      const qty = Number.parseInt(lowerText)
      if (!isNaN(qty) && qty > 0) {
        return { intent: "quantity", value: qty }
      }
    }

    // Detect yes/no for adding more items
    if (orderState === "more") {
      if (lowerText.includes("yes") || lowerText.includes("yeah") || lowerText === "y") {
        return { intent: "more", value: true }
      } else if (lowerText.includes("no") || lowerText.includes("nope") || lowerText === "n") {
        return { intent: "more", value: false }
      }
    }

    // Detect checkout confirmation
    if (orderState === "checkout") {
      if (lowerText.includes("yes") || lowerText.includes("confirm") || lowerText === "y") {
        return { intent: "confirm_order", value: true }
      } else if (lowerText.includes("no") || lowerText.includes("cancel") || lowerText === "n") {
        return { intent: "confirm_order", value: false }
      }
    }

    // Default
    return { intent: "unknown" }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message to local state
    const userMessage = { type: "user", text: input }
    setMessages((prev) => [...prev, userMessage])

    // Process the input
    const result = processInput(input)

    // Clear input field
    setInput("")

    // Store message in Firestore if user is logged in
    if (user) {
      try {
        // If no current chat ID, create a new chat document
        if (!currentChatId) {
          const chatRef = await addDoc(collection(db, "chatHistory"), {
            userId: user.uid,
            timestamp: serverTimestamp(),
            messages: [
              { role: "bot", content: messages[0].text },
              { role: "user", content: input },
            ],
          })
          setCurrentChatId(chatRef.id)
        } else {
          // Update existing chat document
          const chatRef = doc(db, "chatHistory", currentChatId)
          await updateDoc(chatRef, {
            messages: [
              ...messages.map((m) => ({
                role: m.type,
                content: m.text,
              })),
              { role: "user", content: input },
            ],
          })
        }
      } catch (error) {
        console.error("Error storing chat message:", error)
      }
    }

    // Handle different intents
    handleIntent(result)
  }

  // Handle various intents
  const handleIntent = async (result: any) => {
    // Create a variable to store the bot response
    let botResponse = ""

    switch (result.intent) {
      case "category":
        botResponse = await handleCategoryIntent(result.category)
        break
      case "select_item":
        botResponse = await handleItemSelection(result.itemId)
        break
      case "quantity":
        botResponse = await handleQuantitySelection(result.value)
        break
      case "more":
        botResponse = await handleMoreItems(result.value)
        break
      case "confirm_order":
        botResponse = await handleOrderConfirmation(result.value)
        break
      default:
        // Handle unknown intent
        botResponse =
          "I'm not sure what you're looking for. Would you like to order a pizza, pasta, salad, appetizer, or dessert?"
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: botResponse,
          },
        ])
    }

    // Store bot response in Firestore if user is logged in
    if (user && currentChatId) {
      try {
        const chatRef = doc(db, "chatHistory", currentChatId)
        await updateDoc(chatRef, {
          messages: [
            ...messages.map((m) => ({
              role: m.type,
              content: m.text,
            })),
            { role: "bot", content: botResponse },
          ],
        })
      } catch (error) {
        console.error("Error storing bot response:", error)
      }
    }
  }

  // Handle category intent
  const handleCategoryIntent = (category: string) => {
    const recommendations = getRecommendations(category)

    if (recommendations.length === 0) {
      const response = `Sorry, we don't have any ${category} available right now.`
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: response,
        },
      ])
      return response
    }

    let recommendationText = `Here are our ${category} options:\n`
    recommendations.forEach((item, index) => {
      recommendationText += `${index + 1}. ${item.name} - ${item.price.toFixed(2)} - ${item.description}\n`
    })
    recommendationText += "\nPlease enter the number of the item you'd like to order."

    setMessages((prev) => [...prev, { type: "bot", text: recommendationText }])
    setOrderState("recommending")
    return recommendationText
  }

  // Handle item selection
  const handleItemSelection = (itemId: string) => {
    const selectedItem = menuItems.find((item) => item.id === itemId)

    if (!selectedItem) {
      const numericId = Number.parseInt(itemId)
      if (!isNaN(numericId) && numericId > 0 && numericId <= menuItems.length) {
        const indexSelectedItem = menuItems[numericId - 1]
        setCurrentItem(indexSelectedItem)
        const response = `How many ${indexSelectedItem.name} would you like? (Please enter a number)`
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: response,
          },
        ])
        setOrderState("quantity")
        return response
      } else {
        const response = "I couldn't find that item. Please try again."
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: response,
          },
        ])
        return response
      }
    }

    setCurrentItem(selectedItem)
    const response = `How many ${selectedItem.name} would you like? (Please enter a number)`
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: response,
      },
    ])
    setOrderState("quantity")
    return response
  }

  // Handle quantity selection
  const handleQuantitySelection = (quantity: number) => {
    setCurrentQuantity(quantity)

    // Add item to order
    const orderItem = {
      ...currentItem,
      quantity: quantity,
    }

    setCurrentOrder((prev) => [...prev, orderItem])

    const response = `Added ${quantity} ${currentItem.name} to your order. Would you like to order anything else? (yes/no)`
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        text: response,
      },
    ])

    setOrderState("more")
    return response
  }

  // Handle more items
  const handleMoreItems = (wantsMore: boolean) => {
    if (wantsMore) {
      const response = "What else would you like to order? (pizza, pasta, salad, appetizer, dessert)"
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: response,
        },
      ])
      setOrderState("initial")
      return response
    } else {
      // Show order summary
      let summaryText = "Here's your order summary:\n"
      currentOrder.forEach((item, index) => {
        summaryText += `${index + 1}. ${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)}\n`
      })
      summaryText += `\nTotal: ${totalPrice.toFixed(2)}

Would you like to confirm this order? (yes/no)`

      setMessages((prev) => [...prev, { type: "bot", text: summaryText }])
      setOrderState("checkout")
      return summaryText
    }
  }

  // Handle order confirmation
  const handleOrderConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      // Add all items to the cart
      currentOrder.forEach((item) => {
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          description: item.description,
        })
      })

      const response = `Thank you! Your order has been added to your cart. Your total is $${totalPrice.toFixed(2)}. You can now proceed to checkout.`
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: response,
        },
      ])

      toast({
        title: "Order added to cart",
        description: `${currentOrder.length} items have been added to your cart.`,
      })

      // Reset the order
      setCurrentOrder([])
      setOrderState("complete")
      return response
    } else {
      const response = "Order canceled. Would you like to start over? (yes/no)"
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: response,
        },
      ])
      setOrderState("more")
      return response
    }
  }

  // Quick reply buttons
  const QuickReplyButtons = () => {
    if (orderState === "initial") {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInput("I want to order a pizza")
              setTimeout(() => handleSubmit({ preventDefault: () => {} } as React.FormEvent), 100)
            }}
          >
            Order Pizza
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInput("I want to order pasta")
              setTimeout(() => handleSubmit({ preventDefault: () => {} } as React.FormEvent), 100)
            }}
          >
            Order Pasta
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInput("I want a salad")
              setTimeout(() => handleSubmit({ preventDefault: () => {} } as React.FormEvent), 100)
            }}
          >
            Order Salad
          </Button>
        </div>
      )
    }
    return null
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          // Reset chat state when closing the sheet
          setCurrentChatId(null)
        }
      }}
    >
      <SheetTrigger asChild>
        <Button {...props}>
          {children || (
            <>
              <Bot className="h-5 w-5 mr-2" />
              AI Assistant
            </>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Assistant
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 mb-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{message.type === "user" ? "U" : "AI"}</AvatarFallback>
                    {message.type === "bot" && <AvatarImage src="/placeholder.svg?height=32&width=32" />}
                  </Avatar>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.text.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < message.text.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          {currentOrder.length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-medium">Current Order</span>
                </div>
                <Badge>{currentOrder.reduce((sum, item) => sum + item.quantity, 0)} items</Badge>
              </div>
              <div className="text-sm mt-2 font-medium">Total: ${totalPrice.toFixed(2)}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Input
              placeholder="Ask about our menu or place an order..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <QuickReplyButtons />
        </div>
      </SheetContent>
    </Sheet>
  )
}
