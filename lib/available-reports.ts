import fs from 'fs'
import path from 'path'

// Function to find the reports directory
function findReportsDir() {
  // Try different possible locations
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'reports'),
    '/vercel/path1/public/reports',
    '/var/task/public/reports',
    '/public/reports'
  ]
  
  for (const dir of possiblePaths) {
    if (fs.existsSync(dir)) {
      console.log(`Found reports directory at: ${dir}`)
      return dir
    }
  }
  
  // If no directory is found, return the default path
  console.log(`No reports directory found, using default: ${path.join(process.cwd(), 'public', 'reports')}`)
  return path.join(process.cwd(), 'public', 'reports')
}

// Export the REPORTS_DIR constant
export const REPORTS_DIR = findReportsDir()
const REPORTS_LIST_FILE = path.join(REPORTS_DIR, 'available-reports.json')

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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    return {
      files: [],
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

export function getAvailableReports() {
  try {
    // Always update the list of available reports
    const result = updateAvailableReports()
    return result.files
  } catch (error) {
    console.error('Error reading available reports:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available')
    return []
  }
} 