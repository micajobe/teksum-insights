import { NextResponse } from 'next/server';
import { Report } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const reportsDir = path.join(process.cwd(), 'docs');
    const files = fs.readdirSync(reportsDir);
    
    const reports = files
      .filter(file => file.startsWith('tech_business_report_') && file.endsWith('.html'))
      .map(file => {
        const date = file.split('_')[3].split('.')[0];
        const content = fs.readFileSync(path.join(reportsDir, file), 'utf-8');
        
        // TODO: Parse HTML content to extract report data
        // For now, return mock data
        return {
          id: date,
          date,
          headlines: [],
          sections: [],
          generatedAt: new Date().toISOString()
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
} 