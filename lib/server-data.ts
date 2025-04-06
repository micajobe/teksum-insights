import type { ReportData } from "./types"
import fs from 'fs'
import path from 'path'
import { headers } from 'next/headers'
import { getAvailableReports as getAvailableReportsFromFile } from './available-reports'

// Export the REPORTS_DIR constant
export const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports')

// Re-export getAvailableReports
export const getAvailableReports = getAvailableReportsFromFile

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

export async function getReportData(reportParam?: string | null) {
  try {
    console.log('getReportData called with reportParam:', reportParam)
    console.log('REPORTS_DIR:', REPORTS_DIR)
    console.log('Directory exists:', fs.existsSync(REPORTS_DIR))
    
    // Get the list of available reports
    const reports = await getAvailableReports()
    console.log('Available reports:', reports)
    
    // If no reports are available, return null with error info
    if (reports.length === 0) {
      console.log('No reports available')
      return { 
        data: null, 
        filename: null,
        error: {
          message: 'No reports available',
          details: {
            reportsDir: REPORTS_DIR,
            directoryExists: fs.existsSync(REPORTS_DIR),
            availableReports: reports
          }
        }
      }
    }

    // If a specific report is requested, use it
    let filename = reportParam
    console.log('Initial filename:', filename)
    
    if (filename) {
      // Check if the requested report exists
      if (!reports.includes(filename)) {
        console.log(`Requested report ${filename} not found, using latest`)
        filename = reports[0]
      }
    } else {
      // If no report is specified, use the latest one
      filename = reports[0]
    }
    
    console.log('Final filename:', filename)

    // Read the report file
    const filePath = path.join(REPORTS_DIR, filename)
    console.log('Reading report from:', filePath)
    console.log('File exists:', fs.existsSync(filePath))
    
    if (!fs.existsSync(filePath)) {
      console.error(`Report file not found: ${filePath}`)
      return { 
        data: null, 
        filename: null,
        error: {
          message: `Report file not found: ${filePath}`,
          details: {
            filePath,
            fileExists: false,
            availableReports: reports
          }
        }
      }
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContents)
    console.log('Report data loaded successfully')

    return { data, filename }
  } catch (error) {
    console.error('Error reading report data:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    return { 
      data: null, 
      filename: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          reportsDir: REPORTS_DIR,
          directoryExists: fs.existsSync(REPORTS_DIR),
          stack: error instanceof Error ? error.stack : 'No stack trace available'
        }
      }
    }
  }
} 