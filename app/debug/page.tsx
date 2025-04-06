import { getReportData } from "@/lib/server-data"
import { getAvailableReports, REPORTS_DIR } from "@/lib/reports"
import fs from "fs"
import path from "path"
import NavLinks from '@/components/nav-links'

export default async function DebugPage() {
  console.log('Debug page rendering')
  
  // Get environment information
  const isVercel = process.env.VERCEL === '1'
  const vercelEnv = process.env.VERCEL_ENV
  const vercelUrl = process.env.VERCEL_URL
  
  // Get report data
  const { data: reportData, filename, error } = await getReportData()
  
  // Get available reports
  const reports = await getAvailableReports()
  
  // Check if reports directory exists
  const reportsDirExists = fs.existsSync(REPORTS_DIR)
  
  // Check if available-reports.json exists
  const availableReportsFileExists = fs.existsSync(path.join(REPORTS_DIR, 'available-reports.json'))
  
  // Check if the current report file exists
  const currentReportExists = filename ? fs.existsSync(path.join(REPORTS_DIR, filename)) : false
  
  // Get the contents of the reports directory
  let reportsDirContents: string[] = []
  if (reportsDirExists) {
    try {
      reportsDirContents = fs.readdirSync(REPORTS_DIR)
    } catch (error) {
      console.error('Error reading reports directory:', error)
    }
  }
  
  return (
    <div className="min-h-screen bg-white p-8">
      <NavLinks />
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Is Vercel:</span> {isVercel ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Vercel Environment:</span> {vercelEnv || 'Not set'}</p>
            <p><span className="font-medium">Vercel URL:</span> {vercelUrl || 'Not set'}</p>
            <p><span className="font-medium">Node Environment:</span> {process.env.NODE_ENV}</p>
          </div>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Reports Directory</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Reports Directory:</span> {REPORTS_DIR}</p>
            <p><span className="font-medium">Directory Exists:</span> {reportsDirExists ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Available Reports File Exists:</span> {availableReportsFileExists ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Current Report:</span> {filename || 'None'}</p>
            <p><span className="font-medium">Current Report Exists:</span> {currentReportExists ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Number of Reports:</span> {reports.length}</p>
            <div className="mt-2">
              <p className="font-medium mb-2">Report List:</p>
              {reports.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {reports.map((report: string, index: number) => (
                    <li key={index}>{report}</li>
                  ))}
                </ul>
              ) : (
                <p>No reports available</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Reports Directory Contents</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Number of Files:</span> {reportsDirContents.length}</p>
            <div className="mt-2">
              <p className="font-medium mb-2">File List:</p>
              {reportsDirContents.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {reportsDirContents.map((file: string, index: number) => (
                    <li key={index}>{file}</li>
                  ))}
                </ul>
              ) : (
                <p>No files found</p>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 p-6 rounded-lg col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Error</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Error Message:</span> {error.message}</p>
              {error.details && (
                <div className="mt-2">
                  <p className="font-medium mb-2">Error Details:</p>
                  <pre className="bg-white p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="/api/reports/available" 
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Available Reports
          </a>
          {filename && (
            <a 
              href={`/api/reports/${filename}`} 
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Current Report
            </a>
          )}
        </div>
      </div>
    </div>
  )
} 