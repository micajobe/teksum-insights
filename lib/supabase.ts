import { createClient } from '@supabase/supabase-js';
import type { ReportData } from './types';

// Initialize the Supabase client
// These environment variables will need to be set in your .env.local file
// and in your Vercel project settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log Supabase configuration
console.log('=== Supabase Client Configuration ===');
console.log('Supabase URL:', Boolean(supabaseUrl));
console.log('Supabase Anon Key:', Boolean(supabaseAnonKey));

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Helper function to get reports from Supabase
export async function getReportsFromSupabase(): Promise<ReportData[]> {
  console.log('=== getReportsFromSupabase Start ===');
  console.log('isSupabaseConfigured:', isSupabaseConfigured());
  
  if (!isSupabaseConfigured()) {
    console.log('Supabase is not configured, returning empty array');
    return [];
  }

  try {
    console.log('Fetching reports from Supabase...');
    const { data, error } = await supabase
      .from('reports')
      .select('filename, data, timestamp')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching reports from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No reports found in Supabase');
      return [];
    }

    console.log('Successfully fetched reports from Supabase');
    console.log('First report filename:', data[0].filename);
    return data.map(report => ({
      timestamp: report.timestamp,
      filename: report.filename,
      ...report.data
    }));
  } catch (error) {
    console.error('Error in getReportsFromSupabase:', error);
    return [];
  }
}

// Helper function to get a specific report from Supabase
export async function getReportFromSupabase(filename: string): Promise<ReportData | null> {
  console.log('SUPABASE: Starting getReportFromSupabase for filename:', filename);
  console.log('isSupabaseConfigured:', isSupabaseConfigured());

  if (!isSupabaseConfigured()) {
    console.log('SUPABASE: Not configured');
    return null;
  }

  try {
    console.log('SUPABASE: Attempting to fetch report from Supabase');
    let query = supabase
      .from('reports')
      .select('filename, data, timestamp');

    if (filename) {
      query = query.eq('filename', filename);
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) {
      console.error('SUPABASE: Error fetching report:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('SUPABASE: No report found');
      return null;
    }

    console.log('SUPABASE: Successfully fetched report from Supabase');
    console.log('SUPABASE: Raw data structure:', {
      hasData: Boolean(data[0].data),
      hasFilename: Boolean(data[0].filename),
      hasTimestamp: Boolean(data[0].timestamp)
    });

    return {
      timestamp: data[0].timestamp,
      filename: data[0].filename,
      ...data[0].data
    };
  } catch (error) {
    console.error('SUPABASE: Error in getReportFromSupabase:', error);
    return null;
  }
}

// Helper function to save a report to Supabase
export async function saveReportToSupabase(report: ReportData & { filename: string }): Promise<boolean> {
  console.log('SUPABASE: Starting saveReportToSupabase');
  
  if (!isSupabaseConfigured()) {
    console.log('SUPABASE: Not configured, cannot save report');
    return false;
  }

  try {
    console.log('SUPABASE: Attempting to save report to Supabase');
    const { error } = await supabase
      .from('reports')
      .upsert({
        filename: report.filename,
        data: {
          headlines: report.headlines,
          analysis: report.analysis
        },
        timestamp: report.timestamp
      });

    if (error) {
      console.error('SUPABASE: Error saving report:', error);
      return false;
    }

    console.log('SUPABASE: Successfully saved report to Supabase');
    return true;
  } catch (error) {
    console.error('SUPABASE: Exception in saveReportToSupabase:', error);
    return false;
  }
} 