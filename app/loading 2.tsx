export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-digital-blue"></div>
      <p className="mt-4 text-lg text-gray-600">Loading report data...</p>
    </div>
  )
} 