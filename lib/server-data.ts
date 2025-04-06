import type { ReportData } from "./types"
import fs from 'fs'
import path from 'path'
import { headers } from 'next/headers'
import { getAvailableReports, REPORTS_DIR } from './reports'

// Re-export REPORTS_DIR and getAvailableReports
export { REPORTS_DIR, getAvailableReports }

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
    
    // Ensure the reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      console.error('Reports directory not found:', REPORTS_DIR)
      return { 
        data: defaultData, 
        filename: null,
        error: {
          message: 'Reports directory not found',
          details: {
            reportsDir: REPORTS_DIR,
            directoryExists: false
          }
        }
      }
    }
    
    // Get the list of available reports
    const reports = await getAvailableReports()
    console.log('Available reports:', reports)
    
    // If no reports are available, return default data
    if (reports.length === 0) {
      console.log('No reports available, returning default data')
      return { 
        data: defaultData, 
        filename: null,
        error: {
          message: 'No reports available',
          details: {
            reportsDir: REPORTS_DIR,
            directoryExists: true,
            availableReports: []
          }
        }
      }
    }

    // If a specific report is requested, use it
    let filename = reportParam || reports[0]
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
    
    if (!fs.existsSync(filePath)) {
      console.error(`Report file not found: ${filePath}`)
      return { 
        data: defaultData, 
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
    
    let data: ReportData
    try {
      const fileContents = fs.readFileSync(filePath, 'utf-8')
      data = JSON.parse(fileContents)
      
      // Extract date from filename (format: tech_business_report_YYYYMMDD_HHMMSS.json)
      const dateMatch = filename.match(/\d{8}_\d{6}/)
      if (dateMatch) {
        const dateStr = dateMatch[0]
        const year = dateStr.substring(0, 4)
        const month = dateStr.substring(4, 6)
        const day = dateStr.substring(6, 8)
        const hour = dateStr.substring(9, 11)
        const minute = dateStr.substring(11, 13)
        const second = dateStr.substring(13, 15)
        
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        )
        
        data.timestamp = date.toISOString()
      }
    } catch (parseError) {
      console.error('Error parsing report file:', parseError)
      return { 
        data: defaultData, 
        filename: null,
        error: {
          message: 'Error parsing report file',
          details: {
            filePath,
            parseError: parseError instanceof Error ? parseError.message : 'Unknown error'
          }
        }
      }
    }
    
    return { data, filename, error: null }
  } catch (error) {
    console.error('Error getting report data:', error)
    return { 
      data: defaultData, 
      filename: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          reportsDir: REPORTS_DIR,
          directoryExists: fs.existsSync(REPORTS_DIR)
        }
      }
    }
  }
} 