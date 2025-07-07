"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Mic, MicOff, X, Loader2, Volume2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import { menuItems } from "@/lib/menu-data"

type Message = {
  type: "bot" | "user"
  text: string
  isAudio?: boolean
}

export default function VoiceBot({ children, ...props }: React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", text: "Hi there! I'm your voice assistant. What would you like to order today?" },
  ])
  const { addItem } = useCart()
  const { toast } = useToast()
  const recognitionRef = useRef<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [transcript, setTranscript] = useState("")

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore - SpeechRecognition is not in the TypeScript types yet
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript || interimTranscript)
        }

        recognitionRef.current.onend = () => {
          if (listening) {
            // If we're still supposed to be listening, restart
            recognitionRef.current.start()
          }
        }
      } else {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition. Please try a different browser.",
          variant: "destructive",
        })
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [toast, listening])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Function to start listening
  const startListening = () => {
    if (recognitionRef.current) {
      setListening(true)
      setTranscript("")
      recognitionRef.current.start()
    }
  }

  // Function to stop listening and process the transcript
  const stopListening = async () => {
    if (recognitionRef.current) {
      setListening(false)
      recognitionRef.current.stop()

      if (transcript.trim()) {
        await processVoiceInput(transcript)
      }
    }
  }

  // Function to process the voice input
  const processVoiceInput = async (text: string) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: text,
      },
    ])

    setProcessing(true)

    try {
      const response = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error("Failed to process voice command")
      }

      const data = await response.json()

      // Add bot response
      setMessages((prev) => [...prev, { type: "bot", text: data.response }])

      // Process the response to identify menu items
      processResponseForCart(data.response)

      // Speak the response
      speakText(data.response)
    } catch (error) {
      console.error("Error processing voice command:", error)
      toast({
        title: "Processing Error",
        description: "Failed to process your voice command. Please try again.",
        variant: "destructive",
      })

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Sorry, I couldn't process your request. Please try again.",
        },
      ])
    } finally {
      setProcessing(false)
    }
  }

  // Function to process the response and add items to cart
  const processResponseForCart = (response: string) => {
    // Look for menu items mentioned in the response
    menuItems.forEach((item) => {
      // Check if the item name is mentioned in the response
      const itemRegex = new RegExp(`\\b${item.name}\\b`, "i")
      if (itemRegex.test(response)) {
        // Look for quantity indicators
        const quantityRegex = /\b(\d+)\s+(?:of\s+)?(?:the\s+)?(?:an?\s+)?(?:order\s+of\s+)?/i
        const match = response.match(quantityRegex)
        const quantity = match ? Number.parseInt(match[1]) : 1

        // Add item to cart
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: quantity,
          image: item.image,
          description: item.description,
        })

        toast({
          title: "Added to cart",
          description: `${quantity} x ${item.name} has been added to your cart.`,
        })
      }
    })
  }

  // Function to speak the text (text-to-speech)
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button {...props}>
          {children || (
            <>
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice Assistant</span>
            </>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Assistant
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                  {message.type === "bot" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => speakText(message.text)}>
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {processing && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Processing your request...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          {listening && transcript && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm italic">{transcript}</p>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              size="lg"
              className={`rounded-full h-16 w-16 ${listening ? "bg-red-500 hover:bg-red-600" : ""}`}
              onClick={listening ? stopListening : startListening}
              disabled={processing}
            >
              {listening ? (
                <MicOff className="h-6 w-6" />
              ) : processing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {listening
              ? "Listening... Click to stop"
              : processing
                ? "Processing your voice..."
                : "Tap the microphone and speak to order"}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
