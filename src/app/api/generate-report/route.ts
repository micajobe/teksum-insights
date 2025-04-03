import { NextRequest, NextResponse } from 'next/server';
import { TechBusinessScraper } from '../scraper';

export async function GET(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key is not configured',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasOpenAIKey: false,
            isVercel: !!process.env.VERCEL,
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report generation endpoint is active. Use POST to generate a report.',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasOpenAIKey: true,
        isVercel: !!process.env.VERCEL,
      }
    });
  } catch (error) {
    console.error('Error in GET /api/generate-report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL,
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request to /api/generate-report');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Is Vercel:', !!process.env.VERCEL);
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key is not configured',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasOpenAIKey: false,
            isVercel: !!process.env.VERCEL,
          }
        },
        { status: 500 }
      );
    }

    // Initialize the scraper
    const scraper = new TechBusinessScraper();
    
    // Run the scraper
    console.log('Running scraper...');
    const result = await scraper.run();
    
    if (!result.success) {
      console.error('Scraper failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to generate report',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
          }
        },
        { status: 500 }
      );
    }
    
    console.log('Report generated successfully');
    return NextResponse.json({
      success: true,
      message: 'Report generated successfully',
      reportId: result.data?.report?.id,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
      }
    });
  } catch (error) {
    console.error('Error in POST /api/generate-report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        environment: {
          nodeEnv: process.env.NODE_ENV,
          isVercel: !!process.env.VERCEL,
        }
      },
      { status: 500 }
    );
  }
} 