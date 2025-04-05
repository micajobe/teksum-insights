"use client"

import { useEffect } from "react"

export default function GlobalError({
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
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
          <p className="mb-6 text-gray-400">
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
} 