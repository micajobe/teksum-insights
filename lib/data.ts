import type { ReportData } from "./types"
import fs from 'fs'
import path from 'path'
import { headers } from 'next/headers'

// Read the latest report JSON file
const reportsDir = path.join(process.cwd(), 'docs')

// Default data in case no valid report is found
const defaultData: ReportData = {
  timestamp: new Date().toISOString(),
  headlines: [],
  analysis: {
    major_technology_trends: {
      summary: "No data available",
      key_insights: [],
      key_headlines: []
    },
    business_impact_analysis: {
      summary: "No data available",
      key_insights: [],
      key_headlines: []
    },
    industry_movements: {
      summary: "No data available",
      key_insights: [],
      key_headlines: []
    },
    emerging_technologies: {
      summary: "No data available",
      key_insights: [],
      key_headlines: []
    },
    strategic_takeaways: {
      summary: "No data available",
      key_insights: [],
      key_headlines: []
    },
    business_opportunities: []
  }
}

let reportData: ReportData = defaultData

try {
  // Ensure the docs directory exists
  if (!fs.existsSync(reportsDir)) {
    console.error('Reports directory not found')
    throw new Error('Reports directory not found')
  }

  const jsonFiles = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .reverse()

  if (jsonFiles.length === 0) {
    console.error('No JSON reports found')
    throw new Error('No JSON reports found')
  }

  // Get the report filename from the URL if available
  let targetReport = jsonFiles[0]
  
  try {
    // Try to get the report parameter from the URL
    const headersList = headers()
    const url = new URL(headersList.get('x-url') || 'http://localhost:3000')
    const reportParam = url.searchParams.get('report')
    
    if (reportParam && jsonFiles.includes(reportParam)) {
      targetReport = reportParam
    }
  } catch (error) {
    console.error('Error getting URL parameters:', error)
    // Fall back to the latest report
  }

  const reportPath = path.join(reportsDir, targetReport)
  const reportContent = fs.readFileSync(reportPath, 'utf-8')
  
  const parsedData = JSON.parse(reportContent)
  
  // Validate the parsed data has required properties
  if (!parsedData.timestamp || !parsedData.headlines || !parsedData.analysis) {
    console.error('Invalid report data structure')
    throw new Error('Invalid report data structure')
  }
  
  reportData = parsedData
} catch (error) {
  console.error('Error loading report data:', error)
  // Use default data if there's an error
}

export { reportData } 