import { getReportData } from "@/lib/server-data"
import { getAvailableReports, REPORTS_DIR } from "@/lib/available-reports"
import HeadlineGroup from "@/components/headline-group"
import InsightSection from "@/components/insight-section"
import OpportunityCard from "@/components/opportunity-card"
import DropCap from "@/components/drop-cap"
import ReportNavigation from "@/components/report-navigation"
import fs from "fs"

interface BusinessOpportunity {
  opportunity_name: string;
  target_market: string;
  implementation_timeline: string;
  required_resources: string[];
  potential_roi_metrics: string[];
  key_success_factors: string[];
  risk_mitigation_strategies: string[];
}

interface Headline {
  title: string;
  source: string;
  url: string;
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  console.log('Dashboard component rendering')
  console.log('Search params:', searchParams)
  
  const reportParam = searchParams.report as string | undefined
  const { data: reportData, filename, error } = await getReportData(reportParam)
  console.log('getReportData returned:', { filename, hasData: !!reportData, error })
  
  const reportsResult = await getAvailableReports()
  const reports = Array.isArray(reportsResult) ? reportsResult as string[] : []
  console.log('getAvailableReports returned:', reports)
  
  console.log('=== Debug Information ===')
  console.log('Current filename:', filename)
  console.log('All available reports:', reports)
  console.log('Reports array length:', reports.length)
  
  const currentReportIndex = reports.findIndex((report: string) => 
    report === filename
  )
  
  console.log('Current report index:', currentReportIndex)
  console.log('Current report in array:', reports[currentReportIndex])
  
  // Previous report button shows when there are older reports (higher index)
  const hasPreviousReport = currentReportIndex < reports.length - 1
  // Next report button shows when there are newer reports (lower index)
  const hasNextReport = currentReportIndex > 0
  
  console.log('Has previous report:', hasPreviousReport)
  console.log('Has next report:', hasNextReport)
  if (hasPreviousReport) {
    console.log('Previous report would be:', reports[currentReportIndex + 1])
  }
  if (hasNextReport) {
    console.log('Next report would be:', reports[currentReportIndex - 1])
  }
  console.log('=== End Debug Information ===')

  // If no report data is available, display a message
  if (!reportData) {
    console.log('No report data available, displaying message')
    return (
      <div className="min-h-screen bg-white">
        <div className="text-center py-8">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Report Data Unavailable</h2>
            <p className="text-lg text-gray-600 mb-6">
              No report data is available at the moment. Please try again later.
            </p>
            
            <div className="bg-gray-100 p-6 rounded-lg text-left">
              <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Reports Directory:</span> {REPORTS_DIR}</p>
                <p><span className="font-medium">Directory Exists:</span> {fs.existsSync(REPORTS_DIR) ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Available Reports:</span> {reports.length > 0 ? (reports as string[]).join(', ') : 'None'}</p>
                <p><span className="font-medium">Requested Report:</span> {reportParam || 'Latest'}</p>
                <p><span className="font-medium">Current Filename:</span> {filename || 'None'}</p>
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                    <h4 className="font-medium text-red-700 mb-2">Error Details:</h4>
                    <p className="text-red-600">{error.message}</p>
                    {error.details && (
                      <div className="mt-2 text-xs text-red-500">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(error.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('Rendering report data')
  return (
    <div className="min-h-screen bg-white">
      {/* Header with full-width blue background */}
      <div className="w-full animated-gradient mb-16">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:py-20 relative z-10">
          <p className="text-sm font-medium uppercase tracking-wider text-white opacity-80">
            Tech Business Intelligence
          </p>
          <h1 className="font-['Zodiak'] text-4xl sm:text-5xl md:text-6xl font-[555] tracking-tight text-white leading-tight mt-2">
            {reportData.analysis.major_technology_trends.summary.split(".")[0]}.
          </h1>
          <p className="mt-4 text-sm text-white opacity-80">
            {new Date(reportData.timestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4">
        {/* Executive Summary */}
        <section className="mb-16">
          <h2 className="mb-6 font-sans text-2xl font-bold">Executive Summary</h2>
          <div className="prose prose-neutral max-w-none">
            <p className="text-lg leading-relaxed">
              <DropCap letter="T" />
              he technology sector is witnessing significant advancements in artificial intelligence, with particular
              focus on generative AI and AI-driven cybersecurity. Businesses are increasingly leveraging these
              technologies to expand their customer base and improve operational efficiency. Meanwhile, regulatory
              changes and climate disruptions are creating new opportunities for innovation and growth across
              industries.
            </p>
          </div>
        </section>

        {/* Major Technology Trends */}
        <InsightSection
          title="Major Technology Trends"
          summary={reportData.analysis.major_technology_trends.summary}
          insights={reportData.analysis.major_technology_trends.key_insights}
          headlines={reportData.analysis.major_technology_trends.key_headlines}
        />

        {/* Business Impact Analysis */}
        <InsightSection
          title="Business Impact Analysis"
          summary={reportData.analysis.business_impact_analysis.summary}
          insights={reportData.analysis.business_impact_analysis.key_insights}
          headlines={reportData.analysis.business_impact_analysis.key_headlines}
        />

        {/* Industry Movements */}
        <InsightSection
          title="Industry Movements"
          summary={reportData.analysis.industry_movements.summary}
          insights={reportData.analysis.industry_movements.key_insights}
          headlines={reportData.analysis.industry_movements.key_headlines}
        />

        {/* Emerging Technologies */}
        <InsightSection
          title="Emerging Technologies"
          summary={reportData.analysis.emerging_technologies.summary}
          insights={reportData.analysis.emerging_technologies.key_insights}
          headlines={reportData.analysis.emerging_technologies.key_headlines}
        />

        {/* Strategic Takeaways */}
        <InsightSection
          title="Strategic Takeaways"
          summary={reportData.analysis.strategic_takeaways.summary}
          insights={reportData.analysis.strategic_takeaways.key_insights}
          headlines={reportData.analysis.strategic_takeaways.key_headlines}
        />

        {/* Business Opportunities */}
        <section className="mb-16">
          <h2 className="mb-6 font-sans text-2xl font-bold">Business Opportunities</h2>
          <div className="space-y-8">
            {reportData.analysis.business_opportunities.map((opportunity: BusinessOpportunity, index: number) => (
              <OpportunityCard key={index} opportunity={opportunity} />
            ))}
          </div>
        </section>

        {/* Headlines by Source */}
        <section className="mb-16">
          <h2 className="mb-6 font-sans text-2xl font-bold">Headlines by Source</h2>
          {(() => {
            const sources = Array.from(new Set(reportData.headlines.map((h: Headline) => h.source))) as string[];
            return sources.map((source) => (
              <HeadlineGroup
                key={source}
                source={source}
                headlines={reportData.headlines.filter((h: Headline) => h.source === source)}
              />
            ));
          })()}
        </section>

        {/* Navigation Buttons */}
        <ReportNavigation
          hasPreviousReport={hasPreviousReport}
          hasNextReport={hasNextReport}
          currentReportIndex={currentReportIndex}
          reports={reports}
        />

        {/* Recent Reports List */}
        <section className="mt-16 mb-16 border-t pt-8">
          <h2 className="mb-6 font-sans text-2xl font-bold">Recent Reports</h2>
          <div className="space-y-2">
            {reports.slice(0, 5).map((report: string) => (
              <div key={report} className="flex items-center">
                <a 
                  href={`/?report=${encodeURIComponent(report)}`}
                  className="text-digital-blue hover:underline"
                >
                  {report}
                </a>
                {report === filename && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Current</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bold TEKSUM Footer */}
      <footer className="w-full bg-digital-blue py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-['Satoshi'] text-white text-8xl sm:text-[10rem] md:text-[14rem] font-extrabold text-center tracking-tighter">
            TEKSUM
          </h2>
          <div className="text-xs text-center text-white opacity-80 mt-4">© 2025 All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
} 