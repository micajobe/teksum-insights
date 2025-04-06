'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  console.log('ReportNavigation - Current index:', currentReportIndex)
  console.log('ReportNavigation - Reports:', reports)
  console.log('ReportNavigation - Has previous:', hasPreviousReport)
  console.log('ReportNavigation - Has next:', hasNextReport)

  const navigateToReport = (report: string) => {
    console.log('Navigating to report:', report)
    // Create a form and submit it to force a full page reload
    const form = document.createElement('form')
    form.method = 'GET'
    form.action = '/'
    
    const reportInput = document.createElement('input')
    reportInput.type = 'hidden'
    reportInput.name = 'report'
    reportInput.value = report
    
    form.appendChild(reportInput)
    document.body.appendChild(form)
    form.submit()
  }

  return (
    <div className="flex justify-between items-center mb-16">
      {hasPreviousReport && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {
            const prevReport = reports[currentReportIndex + 1]
            console.log('Navigating to previous report:', prevReport)
            navigateToReport(prevReport)
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
            const nextReport = reports[currentReportIndex - 1]
            console.log('Navigating to next report:', nextReport)
            navigateToReport(nextReport)
          }}
        >
          Next Report
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 