import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export async function GET(request: Request) {
  try {
    console.log('Starting scraper...')
    
    // Get the absolute path to the scraper script
    const scraperPath = path.join(process.cwd(), 'scripts', 'tech_business_scraper.py')
    console.log('Scraper path:', scraperPath)
    
    // Check if the scraper script exists
    if (!fs.existsSync(scraperPath)) {
      console.error('Scraper script not found:', scraperPath)
      return NextResponse.json(
        { error: 'Scraper script not found' },
        { status: 500 }
      )
    }
    
    // Run the scraper script
    const { stdout, stderr } = await execAsync(`python ${scraperPath}`)
    
    console.log('Scraper output:', stdout)
    if (stderr) {
      console.error('Scraper errors:', stderr)
    }
    
    // Check if the reports directory exists and list the files
    const reportsDir = path.join(process.cwd(), 'public', 'reports')
    console.log('Reports directory:', reportsDir)
    
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir)
        .filter(file => file.endsWith('.json'))
        .sort((a, b) => b.localeCompare(a)) // Sort in descending order (newest first)
      
      console.log('Reports found:', files)
      
      return NextResponse.json({
        success: true,
        message: 'Scraper completed successfully',
        reports: files
      })
    } else {
      console.error('Reports directory not found:', reportsDir)
      return NextResponse.json(
        { error: 'Reports directory not found' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error running scraper:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 