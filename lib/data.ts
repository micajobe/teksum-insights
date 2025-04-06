import type { ReportData } from "./types"
import fs from 'fs'
import path from 'path'

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

  const latestReport = jsonFiles[0]
  const reportPath = path.join(reportsDir, latestReport)
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