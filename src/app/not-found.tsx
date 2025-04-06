'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold text-foreground">Page Not Found</h2>
      <p className="mb-6 text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
} 