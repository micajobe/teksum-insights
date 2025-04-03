import { NextRequest, NextResponse } from 'next/server';
import { TechBusinessScraper } from '../scraper';

// Helper function to ensure JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { 
    status,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return jsonResponse(
        { 
          success: false, 
          error: 'OpenAI API key is not configured',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasOpenAIKey: false,
            isVercel: !!process.env.VERCEL,
            vercelEnv: process.env.VERCEL_ENV,
            region: process.env.VERCEL_REGION,
          }
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      message: 'Report generation endpoint is active. Use POST to generate a report.',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasOpenAIKey: true,
        isVercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
      }
    });
  } catch (error) {
    console.error('Error in GET /api/generate-report:', error);
    return jsonResponse(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL,
          vercelEnv: process.env.VERCEL_ENV,
          region: process.env.VERCEL_REGION,
        }
      },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request to /api/generate-report');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Is Vercel:', !!process.env.VERCEL);
    console.log('Vercel Environment:', process.env.VERCEL_ENV);
    console.log('Vercel Region:', process.env.VERCEL_REGION);
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return jsonResponse(
        { 
          success: false, 
          error: 'OpenAI API key is not configured',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasOpenAIKey: false,
            isVercel: !!process.env.VERCEL,
            vercelEnv: process.env.VERCEL_ENV,
            region: process.env.VERCEL_REGION,
          }
        },
        500
      );
    }

    // Initialize the scraper
    const scraper = new TechBusinessScraper();
    
    // Run the scraper
    console.log('Running scraper...');
    const result = await scraper.run();
    
    if (!result.success) {
      console.error('Scraper failed:', result.error);
      return jsonResponse(
        { 
          success: false, 
          error: result.error || 'Failed to generate report',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
            vercelEnv: process.env.VERCEL_ENV,
            region: process.env.VERCEL_REGION,
          }
        },
        500
      );
    }
    
    console.log('Report generated successfully');
    
    // Return the report content directly
    return jsonResponse({
      success: true,
      message: 'Report generated successfully',
      report: result.data?.report,
      htmlContent: result.data?.htmlContent,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
      }
    });
  } catch (error) {
    console.error('Error in POST /api/generate-report:', error);
    return jsonResponse(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL,
          vercelEnv: process.env.VERCEL_ENV,
          region: process.env.VERCEL_REGION,
        }
      },
      500
    );
  }
} 