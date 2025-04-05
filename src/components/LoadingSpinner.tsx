import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-purple-500`} />
    </div>
  )
}

export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-gray-800/50 bg-gray-900/50 p-6 ${className}`}>
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  )
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      <div className="h-4 w-3/4 rounded bg-gray-800"></div>
      <div className="h-4 w-1/2 rounded bg-gray-800"></div>
      <div className="h-4 w-5/6 rounded bg-gray-800"></div>
    </div>
  )
} 