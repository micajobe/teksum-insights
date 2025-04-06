import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';

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
  opportunity_name: string;
  target_market: string;
  implementation_timeline: string;
  required_resources: string[];
  potential_roi_metrics: string[];
  key_success_factors: string[];
  risk_mitigation_strategies: string[];
}

interface Analysis {
  major_technology_trends: AnalysisSection;
  business_impact_analysis: AnalysisSection;
  industry_movements: AnalysisSection;
  emerging_technologies: AnalysisSection;
  strategic_takeaways: AnalysisSection;
  business_opportunities: BusinessOpportunity[];
}

interface Report {
  timestamp: string;
  headlines: Headline[];
  analysis: Analysis;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Log OpenAI API key status (without exposing the key)
console.log('OpenAI API key status:', process.env.OPENAI_API_KEY ? 'Available' : 'Not available');

// Define news sources with proper type
const newsSources: Record<string, string> = {
  'McKinsey': 'https://www.mckinsey.com/insights',
  'Deloitte': 'https://www2.deloitte.com/us/en/insights/topics/digital-transformation.html',
  'Forbes Tech': 'https://www.forbes.com/technology/',
  'Wired': 'https://www.wired.com/tag/business/',
  'MIT Tech Review': 'https://www.technologyreview.com/',
  'Harvard Business Review': 'https://hbr.org/topic/technology',
  'TechCrunch': 'https://techcrunch.com',
  'VentureBeat': 'https://venturebeat.com'
};

// Function to check if text is likely a headline
function isLikelyHeadline(text: string): boolean {
  // Headlines are usually 20-200 characters and don't end with common file extensions
  if (!text || text.length < 20 || text.length > 200) {
    return false;
  }
  
  // Skip navigation items and common non-headline text
  const skipPhrases = ['subscribe', 'sign up', 'login', 'sign in', 'menu', 
                     'search', 'newsletter', 'download', 'follow us'];
  if (skipPhrases.some(phrase => text.toLowerCase().includes(phrase))) {
    return false;
  }
  
  return true;
}

// Function to scrape headlines from a site
async function scrapeSite(siteName: string): Promise<Headline[]> {
  console.log(`Attempting to scrape ${siteName}...`);
  try {
    const url = newsSources[siteName];
    if (!url) {
      console.error(`No URL found for ${siteName}`);
      return [];
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    });
    
    console.log(`${siteName} status code: ${response.status}`);
    
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const articles: Headline[] = [];
      
      // Find all h1, h2, and h3 tags that are within links or find nearby links
      const headlines = $('h1, h2, h3');
      console.log(`Found ${headlines.length} potential headlines in ${siteName}`);
      
      const baseUrl = url;
      
      headlines.each((_, headline) => {
        // Get text and clean it up
        const text = $(headline).text().trim();
        
        // Check if it's likely a headline
        if (isLikelyHeadline(text)) {
          // First try to find a parent link
          let link = $(headline).closest('a');
          if (link.length === 0) {
            // If no parent link, look for the nearest link
            link = $(headline).find('a').first() || $(headline).next('a').first();
          }
          
          let url = '#';
          const href = link.length > 0 ? link.attr('href') : undefined;
          if (href) {
            url = href;
            // Handle relative URLs
            if (url.startsWith('/')) {
              // Extract base domain
              const urlObj = new URL(baseUrl);
              const domain = `${urlObj.protocol}//${urlObj.host}`;
              url = domain + url;
            } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
              url = baseUrl.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
            }
          }
          
          // Avoid duplicates
          if (!articles.some(h => h.title === text)) {
            articles.push({
              title: text,
              source: siteName,
              url: url,
              date: new Date().toISOString()
            });
            console.log(`Added headline from ${siteName}: ${text.substring(0, 100)}...`);
          }
        }
      });
      
      // Return top 5 headlines
      return articles.slice(0, 5);
    }
    
    return [];
  } catch (error) {
    console.error(`Error scraping ${siteName}:`, error);
    return [];
  }
}

// Function to collect headlines from all sources
async function getAllHeadlines(): Promise<Headline[]> {
  console.log('Collecting headlines from all sources...');
  const headlines: Headline[] = [];
  
  for (const siteName of Object.keys(newsSources)) {
    try {
      const sourceHeadlines = await scrapeSite(siteName);
      headlines.push(...sourceHeadlines);
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    } catch (error) {
      console.error(`Error with ${siteName}:`, error);
    }
  }
  
  console.log(`Total headlines collected: ${headlines.length}`);
  if (headlines.length > 0) {
    console.log('Sample headlines:');
    headlines.slice(0, 5).forEach(headline => {
      console.log(`- ${headline.title} (${headline.source})`);
    });
  }
  return headlines;
}

// Function to format headlines for the prompt
function formatHeadlinesForPrompt(headlines: Headline[]): string {
  return headlines.map(headline => `${headline.title} (${headline.source})`).join('\n');
}

// Function to get summary from OpenAI
async function getSummary(headlines: Headline[]): Promise<Analysis | null> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables');
      return generateFallbackAnalysis(headlines);
    }

    console.log('Using OpenAI API to generate analysis');
    
    // Prepare the prompt for ChatGPT
    const prompt = `You are a strategic analyst with expertise in technology trends, business strategy, and industry analysis. 
    Based on these technology and business headlines, provide a comprehensive analysis in JSON format with the following structure:
    {
        "major_technology_trends": {
            "summary": "A narrative summary of the major technology trends and their significance",
            "key_insights": [
                "Detailed insight 1 with explanation",
                "Detailed insight 2 with explanation"
            ],
            "key_headlines": [
                "Headline 1 with source and significance",
                "Headline 2 with source and significance"
            ]
        },
        "business_impact_analysis": {
            "summary": "A narrative summary of the business implications and market impacts",
            "key_insights": [
                "Detailed business insight 1 with explanation",
                "Detailed business insight 2 with explanation"
            ],
            "key_headlines": [
                "Headline 1 with source and business significance",
                "Headline 2 with source and business significance"
            ]
        },
        "industry_movements": {
            "summary": "A narrative summary of significant industry shifts and movements",
            "key_insights": [
                "Detailed industry movement 1 with explanation",
                "Detailed industry movement 2 with explanation"
            ],
            "key_headlines": [
                "Headline 1 with source and industry significance",
                "Headline 2 with source and industry significance"
            ]
        },
        "emerging_technologies": {
            "summary": "A narrative summary of emerging technologies and their potential impact",
            "key_insights": [
                "Detailed technology insight 1 with explanation",
                "Detailed technology insight 2 with explanation"
            ],
            "key_headlines": [
                "Headline 1 with source and technology significance",
                "Headline 2 with source and technology significance"
            ]
        },
        "strategic_takeaways": {
            "summary": "A narrative summary of key strategic implications and recommendations",
            "key_insights": [
                "Detailed strategic insight 1 with explanation",
                "Detailed strategic insight 2 with explanation"
            ],
            "key_headlines": [
                "Headline 1 with source and strategic significance",
                "Headline 2 with source and strategic significance"
            ]
        },
        "business_opportunities": [
            {
                "opportunity_name": "Name of the business opportunity",
                "target_market": "Description of the target market",
                "implementation_timeline": "Estimated timeline for implementation",
                "required_resources": [
                    "List of required resources and expertise"
                ],
                "potential_roi_metrics": [
                    "Key metrics to measure success"
                ],
                "key_success_factors": [
                    "Critical factors for success"
                ],
                "risk_mitigation_strategies": [
                    "Strategies to mitigate potential risks"
                ]
            }
        ]
    }

    Headlines:
    ${formatHeadlinesForPrompt(headlines)}

    For each section:
    1. Provide a comprehensive narrative summary that explains the significance and implications
    2. Include detailed insights with explanations of why they matter
    3. Reference specific headlines and explain their significance in the broader context
    4. Focus on actionable insights and strategic implications
    5. Consider both immediate and long-term impacts
    6. Analyze patterns and connections between different trends

    For the business_opportunities section:
    1. Identify 5-7 specific business opportunities based on the trends and insights
    2. For each opportunity, provide:
       - Clear target market definition
       - Realistic implementation timeline
       - Required resources and expertise
       - Specific ROI metrics
       - Key success factors
       - Risk mitigation strategies
    3. Focus on opportunities that are:
       - Immediately actionable
       - Have clear market potential
       - Leverage current technology trends
       - Address identified market needs

    Format the response as valid JSON with rich, detailed content in each section.`;

    // Generate thematic analysis using the OpenAI API
    console.log('Sending request to OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a strategic analyst with expertise in technology trends, business strategy, and industry analysis. Provide detailed, narrative-rich analysis in JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    console.log('Received response from OpenAI API');

    const content = response.choices[0].message.content;
    if (!content) {
      console.error('No content received from OpenAI');
      return null;
    }

    // Parse the response as JSON
    console.log('Parsing OpenAI response as JSON');
    const analysis = JSON.parse(content);
    console.log('Successfully parsed OpenAI response');
    return analysis;
  } catch (error) {
    console.error('Error generating summary:', error);
    return generateFallbackAnalysis(headlines);
  }
}

// Function to generate a fallback analysis when OpenAI API is not available
function generateFallbackAnalysis(headlines: Headline[]): Analysis {
  console.log('Generating fallback analysis');
  
  // Create a simple analysis based on the headlines
  return {
    major_technology_trends: {
      summary: 'Analysis of major technology trends based on recent headlines',
      key_insights: ['AI continues to dominate tech news', 'Cybersecurity remains a top concern'],
      key_headlines: headlines.slice(0, 2).map(h => `${h.title} (${h.source})`)
    },
    business_impact_analysis: {
      summary: 'Analysis of business impact based on recent headlines',
      key_insights: ['Tech companies are focusing on AI integration', 'Startup funding is shifting towards AI and sustainability'],
      key_headlines: headlines.slice(0, 2).map(h => `${h.title} (${h.source})`)
    },
    industry_movements: {
      summary: 'Analysis of industry movements based on recent headlines',
      key_insights: ['Consolidation in the tech industry', 'New players entering the AI market'],
      key_headlines: headlines.slice(0, 2).map(h => `${h.title} (${h.source})`)
    },
    emerging_technologies: {
      summary: 'Analysis of emerging technologies based on recent headlines',
      key_insights: ['Quantum computing advances', 'Edge AI gaining traction'],
      key_headlines: headlines.slice(0, 2).map(h => `${h.title} (${h.source})`)
    },
    strategic_takeaways: {
      summary: 'Strategic takeaways based on recent headlines',
      key_insights: ['Focus on AI integration', 'Invest in cybersecurity'],
      key_headlines: headlines.slice(0, 2).map(h => `${h.title} (${h.source})`)
    },
    business_opportunities: [
      {
        opportunity_name: 'AI Integration Services',
        target_market: 'Businesses looking to integrate AI into their operations',
        implementation_timeline: '3-6 months',
        required_resources: ['AI expertise', 'Development team', 'Integration specialists'],
        potential_roi_metrics: ['Increased efficiency', 'Cost savings', 'New revenue streams'],
        key_success_factors: ['Clear understanding of client needs', 'Strong technical implementation', 'Effective change management'],
        risk_mitigation_strategies: ['Phased implementation', 'Regular testing and validation', 'Comprehensive training']
      }
    ]
  };
}

// Function to generate a report
async function generateReport(): Promise<Report | null> {
  // Collect headlines
  const headlines = await getAllHeadlines();
  
  // Generate analysis
  const analysis = await getSummary(headlines);
  
  if (!analysis) {
    console.error('Failed to generate analysis');
    return null;
  }

  // Create the report data structure
  const reportData: Report = {
    timestamp: new Date().toISOString(),
    headlines: headlines,
    analysis: analysis
  };

  return reportData;
}

// Function to save the report
async function saveReport(report: Report): Promise<void> {
  try {
    // Create the reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'public', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Format the date for the filename
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const filename = `tech_business_report_${dateStr}_${timeStr}.json`;

    // Save the report
    const filePath = path.join(reportsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    // Update the available reports list
    const availableReportsPath = path.join(reportsDir, 'available-reports.json');
    let availableReports: string[] = [];
    
    if (fs.existsSync(availableReportsPath)) {
      try {
        const content = fs.readFileSync(availableReportsPath, 'utf-8');
        availableReports = JSON.parse(content);
      } catch (error) {
        console.error('Error reading available reports file:', error);
        // If there's an error reading the file, start with an empty array
        availableReports = [];
      }
    }
    
    // Add the new report to the beginning of the list
    availableReports.unshift(filename);
    
    // Write the updated list back to the file
    try {
      fs.writeFileSync(availableReportsPath, JSON.stringify(availableReports, null, 2));
    } catch (error) {
      console.error('Error writing to available reports file:', error);
      // Continue even if we can't update the available reports list
    }

    console.log(`Report saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    console.log('Starting scraper...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Vercel environment:', process.env.VERCEL_ENV);
    console.log('OpenAI API key status:', process.env.OPENAI_API_KEY ? 'Available' : 'Not available');
    
    // Generate and save the report
    const report = await generateReport();
    if (!report) {
      return NextResponse.json(
        { error: 'Failed to generate report' },
        { status: 500 }
      );
    }
    
    await saveReport(report);
    
    // Get the list of reports
    const reportsDir = path.join(process.cwd(), 'public', 'reports');
    let files: string[] = [];
    
    if (fs.existsSync(reportsDir)) {
      try {
        files = fs.readdirSync(reportsDir)
          .filter(file => file.endsWith('.json') && file !== 'available-reports.json')
          .filter(file => file.match(/tech_business_report_\d{8}_\d{6}\.json$/))
          .sort((a, b) => {
            // Extract date from filename (format: tech_business_report_YYYYMMDD_HHMMSS.json)
            const dateA = a.match(/\d{8}_\d{6}/)?.[0] || '';
            const dateB = b.match(/\d{8}_\d{6}/)?.[0] || '';
            return dateB.localeCompare(dateA); // Sort in descending order (newest first)
          });
      } catch (error) {
        console.error('Error reading reports directory:', error);
      }
    }
    
    console.log('Reports found:', files);
    
    return NextResponse.json({
      success: true,
      message: 'Scraper completed successfully',
      reports: files,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        openaiKeyAvailable: !!process.env.OPENAI_API_KEY
      }
    });
  } catch (error) {
    console.error('Error running scraper:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          openaiKeyAvailable: !!process.env.OPENAI_API_KEY
        }
      },
      { status: 500 }
    );
  }
} 