import fs from 'fs'
import path from 'path'

const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports')
const REPORTS_LIST_FILE = path.join(process.cwd(), 'public', 'reports', 'available-reports.json')

export function updateAvailableReports() {
  try {
    console.log('Updating available reports from directory:', REPORTS_DIR)
    console.log('Directory exists:', fs.existsSync(REPORTS_DIR))
    
    if (!fs.existsSync(REPORTS_DIR)) {
      console.error('Reports directory not found:', REPORTS_DIR)
      return []
    }
    
    // Get all JSON files in the reports directory
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
      .sort((a, b) => b.localeCompare(a)) // Sort in descending order (newest first)

    console.log('Found files:', files)

    // Write the list to available-reports.json
    fs.writeFileSync(REPORTS_LIST_FILE, JSON.stringify(files, null, 2))
    console.log('Available reports list updated:', files)
    return files
  } catch (error) {
    console.error('Error updating available reports:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    return []
  }
}

export function getAvailableReports() {
  try {
    // Always update the list of available reports
    return updateAvailableReports()
  } catch (error) {
    console.error('Error reading available reports:', error)
    return []
  }
} 