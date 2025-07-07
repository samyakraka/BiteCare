import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI: GoogleGenerativeAI = new GoogleGenerativeAI("APIKEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(request: Request): Promise<Response> {
  try {
    const { image }: { image?: string } = await request.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { "Content-Type": "application/json" }}
      );
    }

    const imagePart = {
      inlineData: {
        data: image,
        mimeType: "image/jpeg",
      },
    };

    const prompt: string = "What food dish is shown in this image? Please respond with just the name of the dish in a single word or short phrase.";
    
    const result = await model.generateContent([prompt, imagePart]);
    const foodName: string = result.response.text().trim();
    
    return new Response(
      JSON.stringify({ foodName }),
      { status: 200, headers: { "Content-Type": "application/json" }}
    );
  } catch (error) {
    console.error("Error analyzing image:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to analyze image" }),
      { status: 500, headers: { "Content-Type": "application/json" }}
    );
  }
}
