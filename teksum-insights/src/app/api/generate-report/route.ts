import { NextResponse } from 'next/server';
import { TechBusinessScraper } from '@/lib/scraper';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Report generation endpoint is active. Use POST to generate a report.' 
  });
}

export async function POST() {
  try {
    console.log('Starting report generation...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    
    const scraper = new TechBusinessScraper();
    const result = await scraper.run();
    
    if (!result.success) {
      console.error('Report generation failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to generate report' 
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
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
} 