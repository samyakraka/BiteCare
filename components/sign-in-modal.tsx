// This component is now replaced by the login page
// We'll keep a minimal version that redirects to the login page

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  redirectAfterSignIn?: string
  message?: string
}

export default function SignInModal({
  open,
  onOpenChange,
  redirectAfterSignIn,
  message = "Sign in to continue",
}: SignInModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (open) {
      // Redirect to login page with the redirect parameter
      const redirectUrl = redirectAfterSignIn
        ? `/login?redirectTo=${encodeURIComponent(redirectAfterSignIn)}`
        : "/login"
      router.push(redirectUrl)
      onOpenChange(false)
    }
  }, [open, redirectAfterSignIn, router, onOpenChange])

  return null // This component no longer renders anything, it just redirects
}
