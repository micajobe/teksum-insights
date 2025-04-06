import fs from 'fs'
import path from 'path'

// Define the reports directory path
export const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports')
const REPORTS_LIST_FILE = path.join(REPORTS_DIR, 'available-reports.json')

// Function to get the list of available reports
export async function getAvailableReports() {
  try {
    console.log('Getting available reports from:', REPORTS_LIST_FILE)
    console.log('File exists:', fs.existsSync(REPORTS_LIST_FILE))
    
    if (!fs.existsSync(REPORTS_LIST_FILE)) {
      console.log('Available reports file not found, updating list')
      return updateAvailableReports().files
    }
    
    const fileContents = fs.readFileSync(REPORTS_LIST_FILE, 'utf-8')
    const reports = JSON.parse(fileContents)
    console.log('Available reports loaded:', reports)
    return reports
  } catch (error) {
    console.error('Error getting available reports:', error)
    return []
  }
}

// Function to update the list of available reports
export function updateAvailableReports() {
  try {
    console.log('Updating available reports from directory:', REPORTS_DIR)
    console.log('Directory exists:', fs.existsSync(REPORTS_DIR))
    
    if (!fs.existsSync(REPORTS_DIR)) {
      console.error('Reports directory not found:', REPORTS_DIR)
      return {
        files: [],
        error: {
          message: 'Reports directory not found',
          details: {
            reportsDir: REPORTS_DIR,
            directoryExists: false
          }
        }
      }
    }
    
    // Get all JSON files in the reports directory
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
      .sort((a, b) => b.localeCompare(a)) // Sort in descending order (newest first)

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