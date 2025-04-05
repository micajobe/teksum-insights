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
      console.error('No report files found in directory:', docsDir);
      // Return a default report structure if no files are found
      return {
        timestamp: new Date().toISOString(),
        headlines: [],
        analysis: {
          major_technology_trends: {
            summary: "No report data available.",
            key_insights: [],
            key_headlines: []
          },
          business_impact_analysis: {
            summary: "No report data available.",
            key_insights: [],
            key_headlines: []
          },
          industry_movements: {
            summary: "No report data available.",
            key_insights: [],
            key_headlines: []
          },
          emerging_technologies: {
            summary: "No report data available.",
            key_insights: [],
            key_headlines: []
          },
          strategic_takeaways: {
            summary: "No report data available.",
            key_insights: [],
            key_headlines: []
          },
          business_opportunities: []
        }
      };
    }
    
    // Sort files by name (which includes timestamp) in descending order
    // to get the most recent file
    jsonFiles.sort().reverse();
    const latestFile = jsonFiles[0];
    
    // Read the latest file
    const filePath = path.join(docsDir, latestFile);
    console.log('Reading report file:', filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const reportData = JSON.parse(fileContent);
    
    return reportData;
  } catch (error) {
    console.error('Error fetching latest report:', error);
    // Return a default report structure if there's an error
    return {
      timestamp: new Date().toISOString(),
      headlines: [],
      analysis: {
        major_technology_trends: {
          summary: "Error loading report data.",
          key_insights: [],
          key_headlines: []
        },
        business_impact_analysis: {
          summary: "Error loading report data.",
          key_insights: [],
          key_headlines: []
        },
        industry_movements: {
          summary: "Error loading report data.",
          key_insights: [],
          key_headlines: []
        },
        emerging_technologies: {
          summary: "Error loading report data.",
          key_insights: [],
          key_headlines: []
        },
        strategic_takeaways: {
          summary: "Error loading report data.",
          key_insights: [],
          key_headlines: []
        },
        business_opportunities: []
      }
    };
  }
}

export default async function Dashboard() {
  const report = await getLatestReport();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <InsightSection
            title="Executive Summary"
            summary={report.analysis.major_technology_trends.summary}
            insights={report.analysis.major_technology_trends.key_insights}
            headlines={report.analysis.major_technology_trends.key_headlines}
          />
          
          <InsightSection
            title="Major Technology Trends"
            summary={report.analysis.major_technology_trends.summary}
            insights={report.analysis.major_technology_trends.key_insights}
            headlines={report.analysis.major_technology_trends.key_headlines}
          />
          
          <InsightSection
            title="Business Impact Analysis"
            summary={report.analysis.business_impact_analysis.summary}
            insights={report.analysis.business_impact_analysis.key_insights}
            headlines={report.analysis.business_impact_analysis.key_headlines}
          />
          
          <InsightSection
            title="Industry Movements"
            summary={report.analysis.industry_movements.summary}
            insights={report.analysis.industry_movements.key_insights}
            headlines={report.analysis.industry_movements.key_headlines}
          />
          
          <InsightSection
            title="Emerging Technologies"
            summary={report.analysis.emerging_technologies.summary}
            insights={report.analysis.emerging_technologies.key_insights}
            headlines={report.analysis.emerging_technologies.key_headlines}
          />
          
          <InsightSection
            title="Strategic Takeaways"
            summary={report.analysis.strategic_takeaways.summary}
            insights={report.analysis.strategic_takeaways.key_insights}
            headlines={report.analysis.strategic_takeaways.key_headlines}
          />
          
          <div className="bg-white rounded-xl p-8 mb-8">
            <h2 className="mb-6 font-sans text-2xl font-bold text-gray-900">Business Opportunities</h2>
            <div className="space-y-6">
              {report.analysis.business_opportunities.map((opportunity, index) => (
                <div key={index} className="border-b pb-6 last:border-b-0">
                  <h3 className="text-xl font-bold mb-2">{opportunity.opportunity_name}</h3>
                  <p className="text-gray-600 mb-4">Target Market: {opportunity.target_market}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold mb-2">Implementation Timeline</h4>
                      <p>{opportunity.implementation_timeline}</p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Required Resources</h4>
                      <ul className="list-disc pl-5">
                        {opportunity.required_resources.map((resource, i) => (
                          <li key={i}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Potential ROI Metrics</h4>
                      <ul className="list-disc pl-5">
                        {opportunity.potential_roi_metrics.map((metric, i) => (
                          <li key={i}>{metric}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Key Success Factors</h4>
                      <ul className="list-disc pl-5">
                        {opportunity.key_success_factors.map((factor, i) => (
                          <li key={i}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-bold mb-2">Risk Mitigation Strategies</h4>
                    <ul className="list-disc pl-5">
                      {opportunity.risk_mitigation_strategies.map((strategy, i) => (
                        <li key={i}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Today's Headlines</h2>
            <div className="space-y-4">
              {report.headlines.map((headline, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <a 
                    href={headline.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {headline.title}
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Source: {headline.source}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Previous Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Previous reports would go here */}
        </div>
      </div>
    </div>
  );
} 