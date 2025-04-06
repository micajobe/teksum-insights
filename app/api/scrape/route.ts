import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';

const execAsync = promisify(exec);

// Define the report structure
interface Headline {
  title: string;
  source: string;
  url: string;
  date: string;
}

interface AnalysisSection {
  summary: string;
  key_insights: string[];
  key_headlines: string[];
}

interface BusinessOpportunity {
  title: string;
  description: string;
  potential_impact: string;
  implementation_complexity: string;
  timeframe: string;
}

interface Report {
  timestamp: string;
  headlines: Headline[];
  analysis: {
    major_technology_trends: AnalysisSection;
    business_impact_analysis: AnalysisSection;
    industry_movements: AnalysisSection;
    emerging_technologies: AnalysisSection;
    strategic_takeaways: AnalysisSection;
    business_opportunities: BusinessOpportunity[];
  };
}

// Function to scrape headlines from TechCrunch
async function scrapeHeadlines(): Promise<Headline[]> {
  try {
    const response = await axios.get('https://techcrunch.com/');
    const $ = cheerio.load(response.data);
    const headlines: Headline[] = [];

    $('article').each((i, element) => {
      const titleElement = $(element).find('h2 a');
      const title = titleElement.text().trim();
      const url = titleElement.attr('href') || '';
      const source = 'TechCrunch';
      const date = new Date().toISOString();

      if (title && url) {
        headlines.push({ title, source, url, date });
      }
    });

    return headlines.slice(0, 10); // Limit to 10 headlines
  } catch (error) {
    console.error('Error scraping headlines:', error);
    return [];
  }
}

// Function to generate analysis
function generateAnalysis(headlines: Headline[]): Report['analysis'] {
  // This is a simplified version of the analysis generation
  // In a real implementation, you would use more sophisticated analysis techniques
  const analysis: Report['analysis'] = {
    major_technology_trends: {
      summary: 'Analysis of major technology trends based on recent headlines',
      key_insights: ['AI continues to dominate tech news', 'Cybersecurity remains a top concern'],
      key_headlines: headlines.slice(0, 2).map(h => h.title)
    },
    business_impact_analysis: {
      summary: 'Analysis of business impact based on recent headlines',
      key_insights: ['Tech companies are focusing on AI integration', 'Startup funding is shifting towards AI and sustainability'],
      key_headlines: headlines.slice(0, 2).map(h => h.title)
    },
    industry_movements: {
      summary: 'Analysis of industry movements based on recent headlines',
      key_insights: ['Consolidation in the tech industry', 'New players entering the AI market'],
      key_headlines: headlines.slice(0, 2).map(h => h.title)
    },
    emerging_technologies: {
      summary: 'Analysis of emerging technologies based on recent headlines',
      key_insights: ['Quantum computing advances', 'Edge AI gaining traction'],
      key_headlines: headlines.slice(0, 2).map(h => h.title)
    },
    strategic_takeaways: {
      summary: 'Strategic takeaways based on recent headlines',
      key_insights: ['Focus on AI integration', 'Invest in cybersecurity'],
      key_headlines: headlines.slice(0, 2).map(h => h.title)
    },
    business_opportunities: [
      {
        title: 'AI Integration Services',
        description: 'Provide services to help businesses integrate AI into their operations',
        potential_impact: 'High',
        implementation_complexity: 'Medium',
        timeframe: 'Short-term'
      }
    ]
  };

  return analysis;
}

// Function to generate a report
async function generateReport(): Promise<Report> {
  const headlines = await scrapeHeadlines();
  const analysis = generateAnalysis(headlines);

  return {
    timestamp: new Date().toISOString(),
    headlines,
    analysis
  };
}

// Function to save the report
function saveReport(report: Report): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 14);
  const filename = `tech_business_report_${timestamp}.json`;
  const reportsDir = path.join(process.cwd(), 'public', 'reports');
  
  // Create the reports directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Save the report
  const reportPath = path.join(reportsDir, filename);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Update the available-reports.json file
  const reportsListFile = path.join(reportsDir, 'available-reports.json');
  let reports: string[] = [];
  
  if (fs.existsSync(reportsListFile)) {
    const fileContents = fs.readFileSync(reportsListFile, 'utf-8');
    reports = JSON.parse(fileContents);
  }
  
  // Add the new report to the list if it's not already there
  if (!reports.includes(filename)) {
    reports.unshift(filename);
    fs.writeFileSync(reportsListFile, JSON.stringify(reports, null, 2));
  }
  
  return filename;
}

export async function GET(request: Request) {
  try {
    console.log('Starting scraper...');
    
    // Generate and save the report
    const report = await generateReport();
    const filename = saveReport(report);
    
    console.log('Report saved:', filename);
    
    // Get the list of reports
    const reportsDir = path.join(process.cwd(), 'public', 'reports');
    const files = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
      .sort((a, b) => b.localeCompare(a)); // Sort in descending order (newest first)
    
    console.log('Reports found:', files);
    
    return NextResponse.json({
      success: true,
      message: 'Scraper completed successfully',
      reports: files
    });
  } catch (error) {
    console.error('Error running scraper:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 