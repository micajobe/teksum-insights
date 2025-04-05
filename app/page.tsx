import HeadlineGroup from "@/components/headline-group"
import InsightSection from "@/components/insight-section"
import OpportunityCard from "@/components/opportunity-card"
import DropCap from "@/components/drop-cap"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ReportData } from "@/lib/types"
import fs from 'fs'
import path from 'path'

// Function to get the latest report data directly from the filesystem
async function getLatestReport(): Promise<ReportData> {
  try {
    // Get the docs directory path
    const docsDir = path.join(process.cwd(), 'docs');
    
    // Read all files in the docs directory
    const files = fs.readdirSync(docsDir);
    
    // Filter for JSON files that match our report pattern
    const jsonFiles = files.filter(file => 
      file.startsWith('tech_business_report_') && 
      file.endsWith('.json')
    );
    
    if (jsonFiles.length === 0) {
      throw new Error('No report files found');
    }
    
    // Sort files by name (which includes timestamp) in descending order
    // to get the most recent file
    jsonFiles.sort().reverse();
    const latestFile = jsonFiles[0];
    
    // Read the latest file
    const filePath = path.join(docsDir, latestFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const reportData = JSON.parse(fileContent);
    
    return reportData;
  } catch (error) {
    console.error('Error fetching latest report:', error);
    throw new Error('Failed to fetch latest report');
  }
}

export default async function Dashboard() {
  // Fetch the latest report data
  const reportData = await getLatestReport();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header with full-width blue background */}
      <div className="w-full animated-gradient mb-16">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:py-20 relative z-10">
          <p className="text-sm font-medium uppercase tracking-wider text-white opacity-80">
            Tech Business Intelligence
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight mt-2">
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
          <h2 className="mb-6 font-sans text-2xl font-bold text-gray-900">Executive Summary</h2>
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
          <h2 className="mb-6 font-sans text-2xl font-bold text-gray-900">Business Opportunities</h2>
          <div className="space-y-8">
            {reportData.analysis.business_opportunities.map((opportunity, index) => (
              <OpportunityCard key={index} opportunity={opportunity} />
            ))}
          </div>
        </section>

        {/* Headlines by Source */}
        <section className="mb-16">
          <h2 className="mb-6 font-sans text-2xl font-bold text-gray-900">Headlines by Source</h2>

          {/* Group headlines by source */}
          {Array.from(new Set(reportData.headlines.map((h) => h.source))).map((source) => (
            <HeadlineGroup
              key={source}
              source={source}
              headlines={reportData.headlines.filter((h) => h.source === source)}
            />
          ))}
        </section>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-16">
          <Button variant="outline" className="flex items-center gap-2 border-[rgb(229,229,229)] text-black bg-white hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4" />
            Previous Report
          </Button>
          <Button variant="outline" className="flex items-center gap-2 border-[rgb(229,229,229)] text-black bg-white hover:bg-gray-100">
            Next Report
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bold TEKSUM Footer */}
      <div className="w-full flex justify-center">
        <footer className="w-full bg-digital-blue py-24 sm:py-32 px-8">
          <h2 className="font-sans text-white text-7xl sm:text-9xl md:text-[12rem] font-extrabold text-center tracking-tighter">
            TEKSUM
          </h2>
        </footer>
      </div>
    </div>
  )
} 