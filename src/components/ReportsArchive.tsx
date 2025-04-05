import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Report } from '@/types'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingCard, LoadingSkeleton } from '@/components/LoadingSpinner'

interface ReportsArchiveProps {
  reports: Report[]
  title?: string
  className?: string
  maxItems?: number
  isLoading?: boolean
}

export function ReportsArchive({ 
  reports, 
  title = "Report Archive", 
  className = "",
  maxItems,
  isLoading = false
}: ReportsArchiveProps) {
  // Limit the number of reports if maxItems is provided
  const displayedReports = maxItems ? reports.slice(0, maxItems) : reports

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {title}
        </h2>
      )}

      <ErrorBoundary>
        {isLoading ? (
          <LoadingCard />
        ) : displayedReports.length === 0 ? (
          <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 p-6 text-center">
            <p className="text-gray-400">No reports available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedReports.map((report) => (
              <div 
                key={report.id}
                className="group rounded-lg border border-gray-800/50 bg-gray-900/50 p-4 transition-all hover:border-purple-500/30 hover:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{report.title}</h3>
                    <p className="mt-1 text-sm text-gray-400">{report.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{report.category}</span>
                    </div>
                  </div>
                  <Link href={`/reports/${report.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      View Report
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
} 