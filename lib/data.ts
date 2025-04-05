import type { ReportData } from "./types"
import fs from 'fs'
import path from 'path'

// Read the latest report JSON file
const reportsDir = path.join(process.cwd(), 'docs')
const jsonFiles = fs.readdirSync(reportsDir)
  .filter(file => file.endsWith('.json'))
  .sort()
  .reverse()

const latestReport = jsonFiles[0]
const reportPath = path.join(reportsDir, latestReport)
const reportContent = fs.readFileSync(reportPath, 'utf-8')

export const reportData: ReportData = JSON.parse(reportContent) 