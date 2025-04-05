import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Insight } from '@/types'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingCard, LoadingSkeleton } from '@/components/LoadingSpinner'

interface InsightsListProps {
  insights: Insight[]
  title?: string
  className?: string
  isLoading?: boolean
}

export function InsightsList({ 
  insights, 
  title = "Key Insights", 
  className = "",
  isLoading = false
}: InsightsListProps) {
  // Group insights by category
  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.category]) {
      acc[insight.category] = []
    }
    acc[insight.category].push(insight)
    return acc
  }, {} as Record<string, Insight[]>)

  // Helper function to get badge color based on impact
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {title}
        </h2>
      )}

      <ErrorBoundary>
        {isLoading ? (
          <LoadingCard />
        ) : insights.length === 0 ? (
          <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 p-6 text-center">
            <p className="text-gray-400">No insights available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-200">{category}</h3>
                <div className="space-y-3">
                  {categoryInsights.map((insight, index) => (
                    <div 
                      key={index}
                      className="rounded-lg border border-gray-800/50 bg-gray-900/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{insight.title}</h4>
                          <p className="mt-1 text-sm text-gray-400">{insight.description}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${getImpactColor(insight.impact)} text-xs`}
                        >
                          {insight.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
} 