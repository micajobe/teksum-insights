import fs from 'fs'
import path from 'path'

export async function getAvailableReports(): Promise<string[]> {
  const reportsDir = path.join(process.cwd(), 'docs')
  if (!fs.existsSync(reportsDir)) {
    return []
  }
  
  // Get all JSON files
  const jsonFiles = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.json'))
  
  // Sort by date (newest first)
  return jsonFiles.sort((a, b) => {
    // Extract date from filename (format: tech_business_report_YYYYMMDD_HHMMSS.json)
    const dateA = a.match(/\d{8}_\d{6}/)?.[0] || ''
    const dateB = b.match(/\d{8}_\d{6}/)?.[0] || ''
    
    // Compare dates (newer dates come first)
    return dateB.localeCompare(dateA)
  })
} 