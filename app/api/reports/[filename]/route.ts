import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { REPORTS_DIR } from '@/lib/reports';
import { getReportFromSupabase, isSupabaseConfigured } from '@/lib/supabase';

// Check if we should use Supabase
const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true' && isSupabaseConfigured();

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    console.log('Getting report:', filename);
    
    // If Supabase is configured and enabled, try to get data from there first
    if (useSupabase) {
      console.log('Using Supabase for report data');
      
      // Get the report from Supabase
      const report = await getReportFromSupabase(filename);
      
      if (report) {
        console.log(`Found report ${filename} in Supabase`);
        return NextResponse.json(report.data);
      } else {
        console.log(`Report ${filename} not found in Supabase, falling back to file system`);
      }
    }
    
    // Fall back to file system if Supabase is not configured or the report was not found
    console.log('Using file system for report data');
    const filePath = path.join(REPORTS_DIR, filename);
    console.log('Reading report from:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Report file not found: ${filePath}`);
      return NextResponse.json(
        { error: `Report file not found: ${filename}` },
        { status: 404 }
      );
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContents);
    console.log('Report data loaded successfully');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting report:', error);
    return NextResponse.json(
      { error: 'Failed to get report' },
      { status: 500 }
    );
  }
} 