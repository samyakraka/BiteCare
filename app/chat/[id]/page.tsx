"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import SignInModal from "@/components/sign-in-modal"

export default function ChatDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [chat, setChat] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signInModalOpen, setSignInModalOpen] = useState(false)

  useEffect(() => {
    const fetchChat = async () => {
      if (!user) return

      try {
        setLoading(true)
        const chatRef = doc(db, "chatHistory", id as string)
        const chatSnap = await getDoc(chatRef)

        if (chatSnap.exists()) {
          const chatData = chatSnap.data()

          // Verify this chat belongs to the current user
          if (chatData.userId !== user.uid) {
            toast({
              title: "Access denied",
              description: "You don't have permission to view this conversation",
              variant: "destructive",
            })
            router.push("/profile")
            return
          }

          setChat({
            id: chatSnap.id,
            ...chatData,
            date: chatData.timestamp?.toDate().toLocaleDateString() || "Unknown date",
            time: chatData.timestamp?.toDate().toLocaleTimeString() || "Unknown time",
          })
        } else {
          toast({
            title: "Conversation not found",
            description: "The conversation you're looking for doesn't exist.",
            variant: "destructive",
          })
          router.push("/profile")
        }
      } catch (error) {
        console.error("Error fetching chat:", error)
        toast({
          title: "Error fetching conversation",
          description: "Could not load conversation details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchChat()
    } else {
      setLoading(false)
    }
  }, [id, user, toast, router])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Sign in to view conversation</h1>
          <p className="text-muted-foreground mb-8">Please sign in to access your conversation history.</p>
          <Button onClick={() => setSignInModalOpen(true)}>Sign In</Button>
          <SignInModal open={signInModalOpen} onOpenChange={setSignInModalOpen} redirectAfterSignIn={`/chat/${id}`} />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Loading conversation...</h1>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Conversation not found</h1>
          <p className="text-muted-foreground mb-8">
            The conversation you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <a href="/profile">Back to Profile</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              Conversation on {chat.date} at {chat.time}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {chat.messages.map((message: any, index: number) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                        {message.role === "bot" && <AvatarImage src="/placeholder.svg?height=32&width=32" />}
                      </Avatar>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {message.content.split("\n").map((line: string, i: number) => (
                          <span key={i}>
                            {line}
                            {i < message.content.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
