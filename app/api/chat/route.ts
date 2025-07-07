import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { menuItems } from "@/lib/menu-data"

// Allow responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Create a system prompt that includes menu information
  const menuInfo = menuItems
    .map(
      (item) =>
        `${item.name}: ${item.description}. Price: $${item.price.toFixed(2)}. Category: ${item.category}. ${item.dietary ? `Dietary: ${item.dietary.join(", ")}` : ""}`,
    )
    .join("\n")

  const systemPrompt = `
    You are an AI assistant for a restaurant ordering system called AI Bistro. 
    Help users find dishes, make recommendations, and assist with placing orders.
    
    Here is the current menu:
    ${menuInfo}
    
    When recommending dishes, consider dietary preferences if mentioned.
    If users want to order, guide them through the process and suggest complementary items.
    Be friendly, helpful, and concise in your responses.
    
    You can help users with:
    1. Finding dishes by category (pizzas, pastas, salads, appetizers, desserts)
    2. Recommending dishes based on dietary preferences (vegetarian, vegan, gluten-free)
    3. Answering questions about ingredients and allergens
    4. Guiding them through the ordering process
    5. Suggesting popular or highly-rated items
    6. Providing information about specials or promotions
    
    When a user wants to place an order, follow these steps:
    1. Ask which category of food they're interested in
    2. Present options from that category
    3. Ask for quantity when they select an item
    4. Ask if they want to add more items
    5. Summarize the order and confirm before adding to cart
    
    Always be helpful, friendly, and conversational in your responses.
  `

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: systemPrompt,
  })

  return result.toDataStreamResponse()
}
