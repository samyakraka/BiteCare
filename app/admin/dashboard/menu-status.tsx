"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { menuDataExists, initializeMenuData } from "@/lib/initialize-firebase-data"
import { Loader2, Check, AlertTriangle } from "lucide-react"

export default function MenuDataStatus() {
  const [status, setStatus] = useState<"loading" | "exists" | "missing">("loading")
  const [initializing, setInitializing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function checkMenuData() {
      try {
        const exists = await menuDataExists()
        setStatus(exists ? "exists" : "missing")
      } catch (error) {
        console.error("Error checking menu data:", error)
        setStatus("missing")
      }
    }

    checkMenuData()
  }, [])

  const handleInitialize = async () => {
    setInitializing(true)
    try {
      const count = await initializeMenuData()
      if (count > 0) {
        toast({
          title: "Success",
          description: `${count} menu items have been added to your database.`,
        })
        setStatus("exists")
      } else {
        toast({
          title: "Information",
          description: "Menu data already exists in the database.",
        })
      }
    } catch (error) {
      console.error("Error initializing menu data:", error)
      toast({
        title: "Error",
        description: "Failed to initialize menu data.",
        variant: "destructive",
      })
    } finally {
      setInitializing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Data Status</CardTitle>
        <CardDescription>Check if menu data is available in Firebase</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === "loading" && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {status === "exists" && <Check className="h-5 w-5 text-green-500" />}
            {status === "missing" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            <span>
              {status === "loading" && "Checking menu data..."}
              {status === "exists" && "Menu data is available in Firebase"}
              {status === "missing" && "Menu data is not available in Firebase"}
            </span>
          </div>
          {status === "missing" && (
            <Button onClick={handleInitialize} disabled={initializing}>
              {initializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Initialize Menu Data"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
