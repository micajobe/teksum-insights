import { NextRequest, NextResponse } from 'next/server';
import { runScraperAndSave } from '@/lib/scraper';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Get the date from the request body or use today's date
    const body = await request.json();
    const date = body.date || new Date().toISOString().split('T')[0];
    
    // Set the output directory
    const outputDir = path.join(process.cwd(), 'src/data/reports');
    
    // Run the scraper
    await runScraperAndSave(date, outputDir);
    
    return NextResponse.json({ success: true, message: `Report generated for ${date}` });
  } catch (error) {
    console.error('Error running scraper:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 