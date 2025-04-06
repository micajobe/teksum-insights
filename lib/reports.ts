import fs from 'fs'
import path from 'path'

// Define the reports directory path
export const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports')
const REPORTS_LIST_FILE = path.join(REPORTS_DIR, 'available-reports.json')

// Function to get the list of available reports
export async function getAvailableReports() {
  try {
    console.log('Getting available reports from:', REPORTS_LIST_FILE)
    
    // If the reports directory doesn't exist, create it
    if (!fs.existsSync(REPORTS_DIR)) {
      console.log('Reports directory not found, creating it')
      fs.mkdirSync(REPORTS_DIR, { recursive: true })
      return []
    }
    
    // If the available reports file doesn't exist, create it with an empty array
    if (!fs.existsSync(REPORTS_LIST_FILE)) {
      console.log('Available reports file not found, creating it')
      fs.writeFileSync(REPORTS_LIST_FILE, JSON.stringify([], null, 2))
      return []
    }
    
    // Read the available reports file
    const fileContents = fs.readFileSync(REPORTS_LIST_FILE, 'utf-8')
    const reports = JSON.parse(fileContents)
    
    // Validate that all reports in the list actually exist
    const validReports = reports.filter((report: string) => {
      const reportPath = path.join(REPORTS_DIR, report)
      const exists = fs.existsSync(reportPath)
      if (!exists) {
        console.warn(`Report listed in available-reports.json but file not found: ${report}`)
      }
      return exists
    })
    
    // If some reports were invalid, update the available reports file
    if (validReports.length !== reports.length) {
      console.log('Updating available reports list to remove invalid entries')
      fs.writeFileSync(REPORTS_LIST_FILE, JSON.stringify(validReports, null, 2))
    }
    
    console.log('Available reports loaded:', validReports)
    return validReports
  } catch (error) {
    console.error('Error getting available reports:', error)
    return []
  }
}

// Function to update the list of available reports
export function updateAvailableReports() {
  try {
    console.log('Updating available reports from directory:', REPORTS_DIR)
    
    // If the reports directory doesn't exist, create it
    if (!fs.existsSync(REPORTS_DIR)) {
      console.log('Reports directory not found, creating it')
      fs.mkdirSync(REPORTS_DIR, { recursive: true })
      return {
        files: [],
        error: null
      }
    }
    
    // Get all JSON files in the reports directory
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
      .filter(file => file.match(/tech_business_report_\d{8}_\d{6}\.json$/))
      .sort((a, b) => {
        // Extract date from filename (format: tech_business_report_YYYYMMDD_HHMMSS.json)
        const dateA = a.match(/\d{8}_\d{6}/)?.[0] || '';
        const dateB = b.match(/\d{8}_\d{6}/)?.[0] || '';
        return dateB.localeCompare(dateA); // Sort in descending order (newest first)
      });

    console.log('Found files:', files)

    // Write the list to available-reports.json
    fs.writeFileSync(REPORTS_LIST_FILE, JSON.stringify(files, null, 2))
    console.log('Available reports list updated:', files)
    return { files, error: null }
  } catch (error) {
    console.error('Error updating available reports:', error)
    return {
      files: [],
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