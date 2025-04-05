import React from 'react'
import { notFound } from "next/navigation"
import { HeadlinesList } from "@/components/HeadlinesList"
import { PageLayout } from '@/components/PageLayout'
import { InsightsList } from '@/components/InsightsList'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { getReportById } from '@/lib/report-loader'

interface ReportPageProps {
  params: {
    id: string
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  console.log('Fetching report with ID:', params.id);
  const report = await getReportById(params.id)
  console.log('Report data:', report);
  
  if (!report) {
    console.log('No report found');
    notFound()
  }

  return (
    <PageLayout
      title={report.title}
      description={report.description}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold mb-4">{report.title}</h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-600 dark:text-gray-400">{report.date}</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  {report.category}
                </span>
              </div>
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: report.content }}
              />
            </div>
          </ErrorBoundary>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Insights */}
          <ErrorBoundary>
            <InsightsList
              insights={report.insights}
              title="Key Insights"
            />
          </ErrorBoundary>

          {/* Headlines */}
          <ErrorBoundary>
            <HeadlinesList
              headlines={report.headlines}
              title="Latest Articles"
              maxItems={5}
            />
          </ErrorBoundary>
        </div>
      </div>
    </PageLayout>
  )
} 