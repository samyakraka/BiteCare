"use client";

import type React from "react";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import type { MenuItem } from "@/lib/menu-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { menuItems } from "@/lib/menu-data";

// Function to calculate image similarity (simplified version for client-side)
function calculateImageSimilarity(uploadedImage: string, menuItem: any) {
  // In a real implementation, this would use ML or API calls
  // For demo purposes, we'll use a random similarity score based on category
  const categories = ["pizzas", "pastas", "salads", "appetizers", "desserts"];
  const categoryIndex = categories.indexOf(menuItem.category);

  // Generate a base similarity score
  let similarity = Math.random() * 0.5 + 0.5; // Between 0.5 and 1.0

  // Adjust based on popularity and rating
  if (menuItem.popular) similarity += 0.1;
  if (menuItem.rating > 4.5) similarity += 0.05;

  // Normalize to 0-1 range
  similarity = Math.min(similarity, 1.0);

  return similarity;
}

async function analyzeImageWithAI(imageBase64: string): Promise<string | null> {
  try {
    const base64Data = imageBase64.includes("base64,")
      ? imageBase64.split("base64,")[1]
      : imageBase64;
    const response = await fetch("/api/analyze-food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Data }),
    });
    if (!response.ok) throw new Error("Failed to analyze image");
    const data = await response.json();
    return data.foodName;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return null;
  }
}

function matchFoodWithMenu(
  foodName: string | null,
  menuItems: MenuItem[]
): any[] {
  if (!foodName) return [];
  const foodNameLower = foodName.toLowerCase();
  const itemsWithScores = menuItems.map((item) => {
    let score = 0;
    const itemNameLower = item.name.toLowerCase();
    if (
      itemNameLower.includes(foodNameLower) ||
      foodNameLower.includes(itemNameLower)
    )
      score += 0.7;
    if (item.description.toLowerCase().includes(foodNameLower)) score += 0.2;
    if (item.category.toLowerCase().includes(foodNameLower)) score += 0.1;
    if (item.popular) score += 0.05;
    if (item.rating > 4.5) score += 0.05;
    return { ...item, similarity: Math.min(score, 1.0) };
  });
  return itemsWithScores
    .sort((a, b) => b.similarity - a.similarity)
    .filter((item) => item.similarity > 0.1)
    .map((item) => ({
      ...item,
      similarityPercentage: `${Math.round(item.similarity * 100)}%`,
    }));
}

export default function ImageSearchButton() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const { toast } = useToast();
  const { addItem } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!image) return;
    setIsSearching(true);
    try {
      const foodName = await analyzeImageWithAI(image);
      const results = matchFoodWithMenu(foodName, menuItems);
      setSearchResults(results);
      toast({
        title: results.length ? "Analysis complete" : "No matches found",
        description: results.length
          ? `Found ${results.length} matching items.`
          : "We couldn't find similar dishes on our menu.",
        variant: results.length ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error in search process:", error);
      toast({
        title: "Search failed",
        description: "There was an error analyzing your image.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = () => {
    setImage(null);
    setSearchResults(null);
    stopCamera();
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera access error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setImage(imageDataUrl);

        // Stop the camera
        stopCamera();
      }
    }
  };

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      description: item.description,
    });

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetSearch();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Camera className="h-5 w-5 mr-2" />
          Image Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search by Image</DialogTitle>
          <DialogDescription>
            Upload a food photo or take a picture to find similar dishes on our
            menu.
          </DialogDescription>
        </DialogHeader>

        {!image ? (
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="camera">Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="py-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or WEBP (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </TabsContent>
            <TabsContent value="camera" className="py-4">
              <div className="flex flex-col items-center justify-center w-full">
                {isCameraActive ? (
                  <div className="relative w-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <Button onClick={takePicture} className="mx-2">
                        Take Photo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={stopCamera}
                        className="mx-2"
                      >
                        Cancel
                      </Button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                ) : (
                  <Button
                    onClick={handleCameraCapture}
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                    variant="ghost"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Take a photo</span> with
                        your camera
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Point your camera at the food you want to find
                      </p>
                    </div>
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : searchResults ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Search Results</h3>
              <Button variant="ghost" size="sm" onClick={resetSearch}>
                <X className="h-4 w-4 mr-2" />
                New Search
              </Button>
            </div>
            <div className="grid gap-4">
              {searchResults.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <Image
                    src={item.image || "/placeholder.svg?height=80&width=80"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        Match: {item.similarityPercentage}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">
                        ${item.price.toFixed(2)}
                      </span>
                      <Button size="sm" onClick={() => handleAddToCart(item)}>
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                onClick={resetSearch}
              >
                <X className="h-4 w-4" />
              </Button>
              <Image
                src={image || "/placeholder.svg?height=400&width=400"}
                alt="Uploaded food"
                width={400}
                height={300}
                className="w-full h-64 object-contain rounded-md"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                "Find Similar Dishes"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
