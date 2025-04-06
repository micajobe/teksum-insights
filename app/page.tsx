import { reportData } from "@/lib/data"
import HeadlineGroup from "@/components/headline-group"
import InsightSection from "@/components/insight-section"
import OpportunityCard from "@/components/opportunity-card"
import DropCap from "@/components/drop-cap"
import ReportNavigation from "@/components/report-navigation"
import fs from 'fs'
import path from 'path'

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

// Get list of available reports
function getAvailableReports() {
  const reportsDir = path.join(process.cwd(), 'docs')
  if (!fs.existsSync(reportsDir)) {
    return []
  }
  return fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .reverse()
}

export default function Dashboard() {
  const reports = getAvailableReports()
  const currentReportIndex = reports.findIndex(report => 
    report === path.basename(reportData.timestamp)
  )
  const hasPreviousReport = currentReportIndex < reports.length - 1
  const hasNextReport = currentReportIndex > 0

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
          {Array.from(new Set(reportData.headlines.map((h: Headline) => h.source))).map((source) => (
            <HeadlineGroup
              key={source}
              source={source}
              headlines={reportData.headlines.filter((h: Headline) => h.source === source)}
            />
          ))}
        </section>

        {/* Navigation Buttons */}
        <ReportNavigation
          hasPreviousReport={hasPreviousReport}
          hasNextReport={hasNextReport}
          currentReportIndex={currentReportIndex}
          reports={reports}
        />
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