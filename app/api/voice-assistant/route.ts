import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { menuItems } from "@/lib/menu-data"
import { fetchMenuItems } from "@/lib/menu-data"

// Allow responses up to 60 seconds for audio processing
export const maxDuration = 60

// Initialize Google AI
const API_KEY = "AIzaSyBWWZCXyqm_sLuv_0M4G8_-ogDiXWwArIw"
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

// Replace the static menuInfo with this function:
// Create menu information for context
async function getMenuInfo() {
  try {
    const items = await fetchMenuItems()
    return items
      .map(
        (item) =>
          `${item.name}: ${item.description}. Price: $${item.price.toFixed(2)}. Category: ${item.category}. ${
            item.dietary ? `Dietary: ${item.dietary.join(", ")}` : ""
          }`,
      )
      .join("\n")
  } catch (error) {
    console.error("Error fetching menu items for voice assistant:", error)
    // Fall back to static menu items
    return menuItems
      .map(
        (item) =>
          `${item.name}: ${item.description}. Price: $${item.price.toFixed(2)}. Category: ${item.category}. ${
            item.dietary ? `Dietary: ${item.dietary.join(", ")}` : ""
          }`,
      )
      .join("\n")
  }
}

// Update the POST function to use the dynamic menu info
export async function POST(request: NextRequest) {
  try {
    // For now, since we can't process audio in this environment,
    // we'll simulate a voice response based on text input
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    // Get menu info dynamically
    const menuInfo = await getMenuInfo()

    // Process with Gemini
    const systemPrompt = `
      You are a voice assistant for a restaurant ordering system called BiteCare.
      Help users find dishes, make recommendations, and assist with placing orders.
      
      Here is the current menu:
      ${menuInfo}
      
      When recommending dishes, consider dietary preferences if mentioned.
      If users want to order, guide them through the process and suggest complementary items.
      Be friendly, helpful, and concise in your responses.
      
      Respond in a conversational way as if speaking to the customer.
      Keep responses brief and focused on helping with food ordering.
    `

    const result = await model.generateContent([systemPrompt, `Customer said: "${text}"`])

    const responseText = result.response.text()

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error("Voice assistant error:", error)
    return NextResponse.json({ error: "Failed to process voice command" }, { status: 500 })
  }
}
