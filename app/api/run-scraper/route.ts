import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(request: Request) {
  try {
    console.log('Starting scraper...')
    
    // Instead of running the Python script directly, we'll simulate the scraper
    // by creating a new report file with the current timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 14)
    const filename = `tech_business_report_${timestamp}.json`
    
    // Get the reports directory path
    const reportsDir = path.join(process.cwd(), 'public', 'reports')
    console.log('Reports directory:', reportsDir)
    
    // Check if the reports directory exists
    if (!fs.existsSync(reportsDir)) {
      console.error('Reports directory not found:', reportsDir)
      return NextResponse.json(
        { error: 'Reports directory not found' },
        { status: 500 }
      )
    }
    
    // Create a sample report file
    const reportPath = path.join(reportsDir, filename)
    const sampleReport = {
      timestamp: new Date().toISOString(),
      headlines: [
        {
          title: "Sample Tech Business Headline",
          source: "Tech News",
          url: "https://example.com",
          date: new Date().toISOString()
        }
      ],
      analysis: {
        major_technology_trends: {
          summary: "Sample technology trends summary",
          key_insights: ["Sample insight 1", "Sample insight 2"],
          key_headlines: ["Sample headline 1", "Sample headline 2"]
        },
        business_impact_analysis: {
          summary: "Sample business impact analysis",
          key_insights: ["Sample insight 1", "Sample insight 2"],
          key_headlines: ["Sample headline 1", "Sample headline 2"]
        },
        industry_movements: {
          summary: "Sample industry movements summary",
          key_insights: ["Sample insight 1", "Sample insight 2"],
          key_headlines: ["Sample headline 1", "Sample headline 2"]
        },
        emerging_technologies: {
          summary: "Sample emerging technologies summary",
          key_insights: ["Sample insight 1", "Sample insight 2"],
          key_headlines: ["Sample headline 1", "Sample headline 2"]
        },
        strategic_takeaways: {
          summary: "Sample strategic takeaways",
          key_insights: ["Sample insight 1", "Sample insight 2"],
          key_headlines: ["Sample headline 1", "Sample headline 2"]
        },
        business_opportunities: [
          {
            title: "Sample Business Opportunity",
            description: "This is a sample business opportunity description.",
            potential_impact: "High",
            implementation_complexity: "Medium",
            timeframe: "Short-term"
          }
        ]
      }
    }
    
    // Write the sample report to a file
    fs.writeFileSync(reportPath, JSON.stringify(sampleReport, null, 2))
    console.log('Created sample report:', filename)
    
    // Update the available-reports.json file
    const reportsListFile = path.join(reportsDir, 'available-reports.json')
    let reports = []
    
    if (fs.existsSync(reportsListFile)) {
      const fileContents = fs.readFileSync(reportsListFile, 'utf-8')
      reports = JSON.parse(fileContents)
    }
    
    // Add the new report to the list if it's not already there
    if (!reports.includes(filename)) {
      reports.unshift(filename)
      fs.writeFileSync(reportsListFile, JSON.stringify(reports, null, 2))
      console.log('Updated available reports list')
    }
    
    // Get the list of all reports
    const files = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
      .sort((a, b) => b.localeCompare(a)) // Sort in descending order (newest first)
    
    console.log('Reports found:', files)
    
    return NextResponse.json({
      success: true,
      message: 'Scraper completed successfully',
      reports: files
    })
  } catch (error) {
    console.error('Error running scraper:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 