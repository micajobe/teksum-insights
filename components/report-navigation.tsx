'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface ReportNavigationProps {
  hasPreviousReport: boolean
  hasNextReport: boolean
  currentReportIndex: number
  reports: string[]
}

export default function ReportNavigation({
  hasPreviousReport,
  hasNextReport,
  currentReportIndex,
  reports
}: ReportNavigationProps) {
  const router = useRouter()

  return (
    <div className="flex justify-between items-center mb-16">
      {hasPreviousReport && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {
            const nextReport = reports[currentReportIndex + 1]
            router.push(`/?report=${nextReport}`)
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Report
        </Button>
      )}
      {hasNextReport && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {
            const prevReport = reports[currentReportIndex - 1]
            router.push(`/?report=${prevReport}`)
          }}
        >
          Next Report
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 