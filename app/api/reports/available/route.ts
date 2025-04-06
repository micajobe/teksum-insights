import { NextResponse } from 'next/server';
import { getAvailableReports } from '@/lib/reports';
import { getReportsFromSupabase, isSupabaseConfigured } from '@/lib/supabase';

// Check if we should use Supabase
const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true' && isSupabaseConfigured();

export async function GET() {
  try {
    // If Supabase is configured and enabled, try to get data from there first
    if (useSupabase) {
      console.log('Using Supabase for available reports');
      
      // Get all reports from Supabase
      const reports = await getReportsFromSupabase();
      
      if (reports && reports.length > 0) {
        // Extract filenames from reports
        const filenames = reports.map(report => report.filename);
        console.log('Available reports from Supabase:', filenames);
        return NextResponse.json(filenames);
      } else {
        console.log('No reports found in Supabase, falling back to file system');
      }
    }
    
    // Fall back to file system if Supabase is not configured or no reports were found
    console.log('Using file system for available reports');
    const reports = await getAvailableReports();
    console.log('Available reports from file system:', reports);
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error getting available reports:', error);
    return NextResponse.json(
      { error: 'Failed to get available reports' },
      { status: 500 }
    );
  }
} 