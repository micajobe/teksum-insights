import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(request: Request) {
  try {
    console.log('Starting scraper...')
    
    // Call the Python serverless function
    const response = await fetch(`${request.url.replace('/api/run-scraper', '/api/scrape')}`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Error running scraper:', data.error)
      return NextResponse.json(
        { error: data.error },
        { status: response.status }
      )
    }
    
    console.log('Scraper completed successfully')
    
    // Check if the reports directory exists and list the files
    const reportsDir = path.join(process.cwd(), 'public', 'reports')
    console.log('Reports directory:', reportsDir)
    
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir)
        .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
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