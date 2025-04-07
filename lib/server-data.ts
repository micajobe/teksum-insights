import type { ReportData, ReportAnalysis } from "./types"
import fs from 'fs'
import path from 'path'
import { headers } from 'next/headers'
import { getAvailableReports, REPORTS_DIR } from './reports'
import { getReportFromSupabase } from './supabase'

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

export async function getReportData(reportParam?: string | null) {
  console.log('getReportData called with reportParam:', reportParam);
  
  try {
    // Get the list of available reports
    const reports = await getAvailableReports();
    console.log('Available reports:', reports);
    
    // If no reports are available, return default data
    if (reports.length === 0) {
      console.log('No reports available, returning default data');
      return { 
        data: getDefaultData(), 
        filename: null,
        error: {
          message: 'No reports available',
          details: {
            availableReports: []
          }
        }
      };
    }

    // If a specific report is requested, use it
    let filename = reportParam || reports[0];
    console.log('Initial filename:', filename);
    
    if (filename) {
      // Check if the requested report exists
      if (!reports.includes(filename)) {
        console.log(`Requested report ${filename} not found, using latest`);
        filename = reports[0];
      }
    } else {
      // If no report is specified, use the latest one
      filename = reports[0];
    }
    
    console.log('Final filename:', filename);

    // Fetch data from Supabase
    const reportData = await getReportFromSupabase(filename);
    
    if (!reportData) {
      console.log('No report found in Supabase');
      return { 
        data: getDefaultData(), 
        filename: null,
        error: {
          message: 'Report not found in Supabase',
          details: {
            filename,
            availableReports: reports
          }
        }
      };
    }
    
    console.log('Successfully fetched report data');
    return { data: reportData, filename, error: null };
    
  } catch (error) {
    console.error('Error fetching report data:', error);
    return { 
      data: getDefaultData(), 
      filename: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    };
  }
}

function getDefaultData(): ReportData {
  return {
    timestamp: new Date().toISOString(),
    headlines: [],
    analysis: {
      major_technology_trends: {
        summary: "No data available",
        key_insights: [],
        key_headlines: []
      },
      business_impact_analysis: {
        summary: "No data available",
        key_insights: [],
        key_headlines: []
      },
      industry_movements: {
        summary: "No data available",
        key_insights: [],
        key_headlines: []
      },
      emerging_technologies: {
        summary: "No data available",
        key_insights: [],
        key_headlines: []
      },
      strategic_takeaways: {
        summary: "No data available",
        key_insights: [],
        key_headlines: []
      },
      business_opportunities: []
    }
  };
} 