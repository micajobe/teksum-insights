import { NextResponse } from 'next/server';
import { TechBusinessScraper } from '@/lib/scraper';

export async function GET() {
  try {
    // Check if OpenAI API key is available
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Report generation endpoint is active. Use POST to generate a report.',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasOpenAIKey,
        isVercel: !!process.env.VERCEL,
      }
    });
  } catch (error) {
    console.error('Error in GET handler:', error);
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

export async function POST() {
  try {
    console.log('Starting report generation...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('Is Vercel environment:', !!process.env.VERCEL);
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.',
          environment: {
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
          }
        },
        { status: 500 }
      );
    }
    
    const scraper = new TechBusinessScraper();
    const result = await scraper.run();
    
    if (!result.success) {
      console.error('Report generation failed:', result.error);
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
    
    console.log('Report generation completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Report generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in report generation:', error);
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