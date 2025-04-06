import fs from 'fs'
import path from 'path'
import NavLinks from '@/components/nav-links'

export default function TestPage() {
  try {
    // Get the reports directory path
    const reportsDir = path.join(process.cwd(), 'public', 'reports')
    console.log('Reports directory:', reportsDir)
    
    // Check if directory exists
    if (!fs.existsSync(reportsDir)) {
      return (
        <div className="min-h-screen bg-white p-8">
          <NavLinks />
          <h1 className="text-3xl font-bold mb-6">Test Page - Error</h1>
          <div className="bg-red-100 p-4 rounded">
            <p className="text-red-700">Reports directory not found: {reportsDir}</p>
          </div>
        </div>
      )
    }
    
    // Get the list of available reports
    const files = fs.readdirSync(reportsDir)
    console.log('Files in reports directory:', files)
    
    const reports = files
      .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
      .sort((a, b) => {
        // Extract date from filename for sorting
        const dateA = a.match(/\d{8}_\d{6}/)?.[0] || '';
        const dateB = b.match(/\d{8}_\d{6}/)?.[0] || '';
        return dateB.localeCompare(dateA); // Sort in descending order (newest first)
      });
    
    console.log('Filtered reports:', reports)
    
    if (reports.length === 0) {
      return (
        <div className="min-h-screen bg-white p-8">
          <NavLinks />
          <h1 className="text-3xl font-bold mb-6">Test Page - No Reports</h1>
          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-yellow-700">No report files found in {reportsDir}</p>
            <p className="mt-2">Available files:</p>
            <ul className="list-disc pl-6 mt-2">
              {files.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
    
    // Get the latest report
    const latestReport = reports[0];
    console.log('Latest report:', latestReport)
    
    const reportPath = path.join(reportsDir, latestReport);
    console.log('Report path:', reportPath)
    
    const reportContent = fs.readFileSync(reportPath, 'utf-8');
    console.log('Report content length:', reportContent.length)
    
    const reportData = JSON.parse(reportContent);
    console.log('Parsed report data keys:', Object.keys(reportData))
    
    return (
      <div className="min-h-screen bg-white p-8">
        <NavLinks />
        <h1 className="text-3xl font-bold mb-6">Test Page - Direct Report Data</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Report Information</h2>
          <p><strong>Filename:</strong> {latestReport}</p>
          <p><strong>Timestamp:</strong> {reportData.timestamp}</p>
          <p><strong>Headlines Count:</strong> {reportData.headlines?.length || 0}</p>
        </div>
        
        {reportData.headlines && reportData.headlines.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Headlines</h2>
            <ul className="list-disc pl-6 space-y-2">
              {reportData.headlines.slice(0, 10).map((headline: any, index: number) => (
                <li key={index}>
                  <strong>{headline.title}</strong> ({headline.source})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {reportData.analysis?.major_technology_trends && (
          <div className="mb-8">
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
            
            {reportData.analysis.major_technology_trends.key_headlines && (
              <>
                <h3 className="font-semibold mt-4 mb-2">Key Headlines:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {reportData.analysis.major_technology_trends.key_headlines.map((headline: any, index: number) => (
                    <li key={index}>
                      {typeof headline === 'string' ? headline : `${headline.title} (${headline.source})`}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        
        {reportData.analysis?.business_opportunities && reportData.analysis.business_opportunities.length > 0 && (
          <div className="mb-8">
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
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Raw Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in test page:', error)
    return (
      <div className="min-h-screen bg-white p-8">
        <NavLinks />
        <h1 className="text-3xl font-bold mb-6">Test Page - Error</h1>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-700">Error loading report data: {error instanceof Error ? error.message : String(error)}</p>
          <pre className="mt-4 p-4 bg-red-50 rounded text-xs overflow-auto">
            {error instanceof Error ? error.stack : 'No stack trace available'}
          </pre>
        </div>
      </div>
    )
  }
} 