import fs from 'fs'
import path from 'path'
import NavLinks from '@/components/nav-links'

export default function SimplePage() {
  try {
    // Get the reports directory path
    const reportsDir = path.join(process.cwd(), 'public', 'reports')
    
    // Get the list of available reports
    const files = fs.readdirSync(reportsDir)
    const reports = files
      .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
      .sort((a, b) => {
        // Extract date from filename for sorting
        const dateA = a.match(/\d{8}_\d{6}/)?.[0] || '';
        const dateB = b.match(/\d{8}_\d{6}/)?.[0] || '';
        return dateB.localeCompare(dateA); // Sort in descending order (newest first)
      });
    
    // Get the latest report
    const latestReport = reports[0];
    const reportPath = path.join(reportsDir, latestReport);
    const reportContent = fs.readFileSync(reportPath, 'utf-8');
    const reportData = JSON.parse(reportContent);
    
    return (
      <div className="min-h-screen bg-white p-8">
        <NavLinks />
        <h1 className="text-3xl font-bold mb-6">Simple Report View</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Report Information</h2>
          <p><strong>Filename:</strong> {latestReport}</p>
          <p><strong>Timestamp:</strong> {reportData.timestamp}</p>
          <p><strong>Headlines Count:</strong> {reportData.headlines?.length || 0}</p>
        </div>
        
        {reportData.analysis?.major_technology_trends && (
          <div className="mb-8 border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Major Technology Trends</h2>
            <p className="mb-4"><strong>Summary:</strong> {reportData.analysis.major_technology_trends.summary}</p>
            
            {reportData.analysis.major_technology_trends.key_insights && (
              <>
                <h3 className="font-semibold mb-2">Key Insights:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {reportData.analysis.major_technology_trends.key_insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        
        {reportData.analysis?.business_impact_analysis && (
          <div className="mb-8 border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Business Impact Analysis</h2>
            <p className="mb-4"><strong>Summary:</strong> {reportData.analysis.business_impact_analysis.summary}</p>
            
            {reportData.analysis.business_impact_analysis.key_insights && (
              <>
                <h3 className="font-semibold mb-2">Key Insights:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {reportData.analysis.business_impact_analysis.key_insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        
        {reportData.analysis?.industry_movements && (
          <div className="mb-8 border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Industry Movements</h2>
            <p className="mb-4"><strong>Summary:</strong> {reportData.analysis.industry_movements.summary}</p>
            
            {reportData.analysis.industry_movements.key_insights && (
              <>
                <h3 className="font-semibold mb-2">Key Insights:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {reportData.analysis.industry_movements.key_insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        
        {reportData.analysis?.emerging_technologies && (
          <div className="mb-8 border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Emerging Technologies</h2>
            <p className="mb-4"><strong>Summary:</strong> {reportData.analysis.emerging_technologies.summary}</p>
            
            {reportData.analysis.emerging_technologies.key_insights && (
              <>
                <h3 className="font-semibold mb-2">Key Insights:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {reportData.analysis.emerging_technologies.key_insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        
        {reportData.analysis?.strategic_takeaways && (
          <div className="mb-8 border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Strategic Takeaways</h2>
            <p className="mb-4"><strong>Summary:</strong> {reportData.analysis.strategic_takeaways.summary}</p>
            
            {reportData.analysis.strategic_takeaways.key_insights && (
              <>
                <h3 className="font-semibold mb-2">Key Insights:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {reportData.analysis.strategic_takeaways.key_insights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        
        {reportData.analysis?.business_opportunities && reportData.analysis.business_opportunities.length > 0 && (
          <div className="mb-8 border p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Business Opportunities</h2>
            <div className="space-y-4">
              {reportData.analysis.business_opportunities.map((opportunity: any, index: number) => (
                <div key={index} className="border p-4 rounded">
                  <h3 className="font-semibold">{opportunity.opportunity_name}</h3>
                  <p><strong>Target Market:</strong> {opportunity.target_market}</p>
                  <p><strong>Implementation Timeline:</strong> {opportunity.implementation_timeline}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <NavLinks />
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-700">Error loading report data: {error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    )
  }
} 