import type { ReportData, ReportAnalysis } from "./types"
import fs from 'fs'
import path from 'path'
import { headers } from 'next/headers'
import { getAvailableReports, REPORTS_DIR } from './reports'

// Re-export REPORTS_DIR and getAvailableReports
export { REPORTS_DIR, getAvailableReports }

// Define the headline object type
interface HeadlineObject {
  title: string;
  source: string;
  url: string;
}

// Default data in case no valid report is found
const defaultData: ReportData = {
  timestamp: new Date().toISOString(),
  headlines: [],
  analysis: {
    major_technology_trends: {
      summary: "Loading report data...",
      key_insights: [],
      key_headlines: []
    },
    business_impact_analysis: {
      summary: "Loading report data...",
      key_insights: [],
      key_headlines: []
    },
    industry_movements: {
      summary: "Loading report data...",
      key_insights: [],
      key_headlines: []
    },
    emerging_technologies: {
      summary: "Loading report data...",
      key_insights: [],
      key_headlines: []
    },
    strategic_takeaways: {
      summary: "Loading report data...",
      key_insights: [],
      key_headlines: []
    },
    business_opportunities: []
  }
}

// Type for analysis sections
type AnalysisSection = 'major_technology_trends' | 'business_impact_analysis' | 'industry_movements' | 'emerging_technologies' | 'strategic_takeaways';

// Helper function to convert string headlines to object format
function convertHeadlinesToObjects(headlines: string[]): HeadlineObject[] {
  return headlines.map(headline => {
    // Extract title and source from the headline string
    // Format is typically: "Title (Source): Description"
    const match = headline.match(/^(.*?)\s*\((.*?)\):\s*(.*)$/);
    if (match) {
      const [_, title, source, description] = match;
      return {
        title: title.trim(),
        source: source.trim(),
        url: "#" // No URL available in the string format
      };
    }
    
    // If the format doesn't match, try to extract just the title and source
    const simpleMatch = headline.match(/^(.*?)\s*\((.*?)\)/);
    if (simpleMatch) {
      const [_, title, source] = simpleMatch;
      return {
        title: title.trim(),
        source: source.trim(),
        url: "#"
      };
    }
    
    // If no parentheses found, use the whole string as the title
    return {
      title: headline.trim(),
      source: "Unknown",
      url: "#"
    };
  });
}

// Function to fetch report data from a URL
async function fetchReportFromUrl(url: string): Promise<ReportData | null> {
  try {
    console.log('Fetching report from URL:', url);
    const response = await fetch(url, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log('Successfully fetched report data from URL');
    return data;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
}

export async function getReportData(reportParam?: string | null) {
  try {
    console.log('getReportData called with reportParam:', reportParam)
    console.log('REPORTS_DIR:', REPORTS_DIR)
    console.log('Directory exists:', fs.existsSync(REPORTS_DIR))
    
    // Check if we're in a serverless environment (Vercel)
    const isServerless = process.env.VERCEL === '1';
    console.log('Is serverless environment:', isServerless);
    
    // Ensure the reports directory exists
    if (!fs.existsSync(REPORTS_DIR) && !isServerless) {
      console.error('Reports directory not found:', REPORTS_DIR)
      return { 
        data: defaultData, 
        filename: null,
        error: {
          message: 'Reports directory not found',
          details: {
            reportsDir: REPORTS_DIR,
            directoryExists: false
          }
        }
      }
    }
    
    // Get the list of available reports
    let reports: string[] = [];
    
    if (isServerless) {
      // In Vercel, fetch the available reports from the API
      let baseUrl = '';
      
      if (process.env.VERCEL_URL) {
        // Use the Vercel URL in production
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.VERCEL_ENV === 'preview') {
        // Use the preview URL for preview deployments
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        // Fallback to localhost for local development
        baseUrl = 'http://localhost:3000';
      }
      
      const availableReportsUrl = `${baseUrl}/api/reports/available`;
      console.log('Fetching available reports from API:', availableReportsUrl);
      
      try {
        const response = await fetch(availableReportsUrl, { 
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (response.ok) {
          reports = await response.json();
          console.log('Available reports from API:', reports);
        } else {
          console.error('Error fetching available reports from API:', response.status);
          // Fall back to file system if API fails
          reports = await getAvailableReports();
        }
      } catch (error) {
        console.error('Error fetching available reports from API:', error);
        // Fall back to file system if API fails
        reports = await getAvailableReports();
      }
    } else {
      // In local development, read from the file system
      reports = await getAvailableReports();
    }
    
    console.log('Available reports:', reports)
    
    // If no reports are available, return default data
    if (reports.length === 0) {
      console.log('No reports available, returning default data')
      return { 
        data: defaultData, 
        filename: null,
        error: {
          message: 'No reports available',
          details: {
            reportsDir: REPORTS_DIR,
            directoryExists: fs.existsSync(REPORTS_DIR),
            availableReports: []
          }
        }
      }
    }

    // If a specific report is requested, use it
    let filename = reportParam || reports[0]
    console.log('Initial filename:', filename)
    
    if (filename) {
      // Check if the requested report exists
      if (!reports.includes(filename)) {
        console.log(`Requested report ${filename} not found, using latest`)
        filename = reports[0]
      }
    } else {
      // If no report is specified, use the latest one
      filename = reports[0]
    }
    
    console.log('Final filename:', filename)

    let data: ReportData;
    
    if (isServerless) {
      // In Vercel, fetch the report from the API
      let baseUrl = '';
      
      if (process.env.VERCEL_URL) {
        // Use the Vercel URL in production
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.VERCEL_ENV === 'preview') {
        // Use the preview URL for preview deployments
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        // Fallback to localhost for local development
        baseUrl = 'http://localhost:3000';
      }
      
      const reportUrl = `${baseUrl}/api/reports/${filename}`;
      console.log('Fetching report from API:', reportUrl);
      
      const fetchedData = await fetchReportFromUrl(reportUrl);
      if (!fetchedData) {
        console.error(`Could not fetch report data from API: ${reportUrl}`);
        
        // Try a fallback approach - fetch directly from the reports directory
        const fallbackUrl = `${baseUrl}/reports/${filename}`;
        console.log('Trying fallback approach, fetching from reports directory:', fallbackUrl);
        
        const fallbackData = await fetchReportFromUrl(fallbackUrl);
        if (fallbackData) {
          console.log('Successfully fetched report from fallback URL');
          return { data: fallbackData, filename, error: null };
        }
        
        return { 
          data: defaultData, 
          filename: null,
          error: {
            message: `Could not fetch report data from API: ${reportUrl}`,
            details: {
              reportUrl,
              availableReports: reports
            }
          }
        };
      }
      data = fetchedData;
    } else {
      // In local development, read from the file system
      const filePath = path.join(REPORTS_DIR, filename)
      console.log('Reading report from:', filePath)
      console.log('File exists:', fs.existsSync(filePath))
      
      if (!fs.existsSync(filePath)) {
        console.error(`Report file not found: ${filePath}`)
        return { 
          data: defaultData, 
          filename: null,
          error: {
            message: `Report file not found: ${filePath}`,
            details: {
              filePath,
              fileExists: false,
              availableReports: reports
            }
          }
        }
      }
      
      try {
        const fileContents = fs.readFileSync(filePath, 'utf-8')
        console.log('File contents length:', fileContents.length)
        
        // Log the first 100 characters of the file contents for debugging
        console.log('File contents preview:', fileContents.substring(0, 100))
        
        data = JSON.parse(fileContents)
        console.log('Parsed data:', JSON.stringify(data).substring(0, 100) + '...')
      } catch (parseError) {
        console.error('Error parsing report file:', parseError)
        return { 
          data: defaultData, 
          filename: null,
          error: {
            message: 'Error parsing report file',
            details: {
              filePath,
              parseError: parseError instanceof Error ? parseError.message : 'Unknown error'
            }
          }
        }
      }
    }
    
    // Extract date from filename (format: tech_business_report_YYYYMMDD_HHMMSS.json)
    const dateMatch = filename.match(/\d{8}_\d{6}/)
    if (dateMatch) {
      const dateStr = dateMatch[0]
      const year = dateStr.substring(0, 4)
      const month = dateStr.substring(4, 6)
      const day = dateStr.substring(6, 8)
      const hour = dateStr.substring(9, 11)
      const minute = dateStr.substring(11, 13)
      const second = dateStr.substring(13, 15)
      
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      )
      
      data.timestamp = date.toISOString()
    } else {
      // Try the alternative format: tech_business_report_YYYY-MM-DD.json
      const altDateMatch = filename.match(/\d{4}-\d{2}-\d{2}/)
      if (altDateMatch) {
        const dateStr = altDateMatch[0]
        const [year, month, day] = dateStr.split('-').map((num: string) => parseInt(num))
        
        const date = new Date(year, month - 1, day)
        data.timestamp = date.toISOString()
      }
    }
    
    // Ensure all required fields are present
    if (!data.analysis) {
      console.error('Report data missing analysis field')
      data.analysis = defaultData.analysis
    }
    
    if (!data.headlines) {
      console.error('Report data missing headlines field')
      data.headlines = defaultData.headlines
    }
    
    // Ensure each analysis section has the required fields
    const sections: AnalysisSection[] = [
      'major_technology_trends',
      'business_impact_analysis',
      'industry_movements',
      'emerging_technologies',
      'strategic_takeaways'
    ]
    
    for (const section of sections) {
      if (!data.analysis[section]) {
        console.error(`Report data missing ${section} section`)
        data.analysis[section] = defaultData.analysis[section]
      } else {
        // Ensure each section has the required fields
        if (!data.analysis[section].summary) {
          console.error(`Report data missing ${section}.summary field`)
          data.analysis[section].summary = defaultData.analysis[section].summary
        }
        
        if (!data.analysis[section].key_insights) {
          console.error(`Report data missing ${section}.key_insights field`)
          data.analysis[section].key_insights = defaultData.analysis[section].key_insights
        }
        
        if (!data.analysis[section].key_headlines) {
          console.error(`Report data missing ${section}.key_headlines field`)
          data.analysis[section].key_headlines = defaultData.analysis[section].key_headlines
        } else {
          // Convert string headlines to object format if needed
          const headlines = data.analysis[section].key_headlines;
          if (headlines.length > 0 && typeof headlines[0] === 'string') {
            console.log(`Converting ${section}.key_headlines from strings to objects`);
            // Use type assertion to handle the conversion
            (data.analysis[section] as any).key_headlines = convertHeadlinesToObjects(headlines as string[]);
          }
        }
      }
    }
    
    // Ensure business_opportunities field is present
    if (!data.analysis.business_opportunities) {
      console.error('Report data missing business_opportunities field')
      data.analysis.business_opportunities = defaultData.analysis.business_opportunities
    }
    
    return { data, filename, error: null }
  } catch (error) {
    console.error('Error getting report data:', error)
    return { 
      data: defaultData, 
      filename: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          reportsDir: REPORTS_DIR,
          directoryExists: fs.existsSync(REPORTS_DIR)
        }
      }
    }
  }
} 