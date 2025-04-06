import fs from 'fs'
import path from 'path'
import NavLinks from '@/components/nav-links'

export default function RawPage() {
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
        <h1 className="text-3xl font-bold mb-6">Raw Report Data</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Report Information</h2>
          <p><strong>Filename:</strong> {latestReport}</p>
          <p><strong>Timestamp:</strong> {reportData.timestamp}</p>
          <p><strong>Headlines Count:</strong> {reportData.headlines?.length || 0}</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Raw JSON Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[80vh] text-xs">
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </div>
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