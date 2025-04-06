import fs from 'fs'
import path from 'path'

const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports')
const REPORTS_LIST_FILE = path.join(process.cwd(), 'public', 'reports', 'available-reports.json')

export function updateAvailableReports() {
  try {
    // Get all JSON files in the reports directory
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
      .sort((a, b) => b.localeCompare(a)) // Sort in descending order (newest first)

    // Write the list to available-reports.json
    fs.writeFileSync(REPORTS_LIST_FILE, JSON.stringify(files, null, 2))
    console.log('Available reports list updated:', files)
    return files
  } catch (error) {
    console.error('Error updating available reports:', error)
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