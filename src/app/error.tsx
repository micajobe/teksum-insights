"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold text-foreground">Something went wrong!</h2>
      <p className="mb-6 text-muted-foreground">
        {error.message || "An unexpected error occurred"}
      </p>
      <Button
        onClick={reset}
        variant="default"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </Button>
    </div>
  )
} 